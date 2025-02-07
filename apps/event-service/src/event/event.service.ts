import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { EventDocument } from './schemas/event.schema';
import { InvitedUser, InvitedUserDocument } from './schemas/invite.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { Model, Types } from 'mongoose';
import { CategoryDocument, EventCategory } from '../event-category/schemas/event-category.schema';
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';
import { SendEventInvitesRequest, SendEventInvitesResponse, CancelEventRequest, EventType, EventResponse, CreateEventRequest, UpdateEventRequest, UserTypeInvite, GetEventFeedbacksResponse } from '../../../../libs/common/src/types/event';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { QueryParamsRequest } from '../../../../libs/common/src';
import { lastValueFrom } from 'rxjs';
import { TICKET_SERVICE } from '../../../apigateway/src/constants/service.constant';
import { GetParticipantByEventIdRequest, TICKET_SERVICE_PROTO_SERVICE_NAME, TicketServiceProtoClient } from '../../../../libs/common/src/types/ticket';
import { JwtService } from '@nestjs/jwt';
import { FeedbackService } from '../feedback/feedback.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';

@Injectable()
export class EventService {
    private readonly logger = new Logger(EventService.name);
    private ticketService: TicketServiceProtoClient;

    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(EventCategory.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(InvitedUser.name) private invitedUserModel: Model<InvitedUserDocument>,
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
        @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
        @Inject('TICKET_SERVICE_RABBIT') private readonly clientTicket: ClientProxy,
        @Inject('NOTIFICATION_SERVICE') private readonly clientNotification: ClientProxy,

        @Inject(TICKET_SERVICE) private ticketServiceClient: ClientGrpc,
        private jwtService: JwtService,
        private readonly feedbackService: FeedbackService,
    ) { }

    onModuleInit() {
        this.ticketService = this.ticketServiceClient.getService<TicketServiceProtoClient>(TICKET_SERVICE_PROTO_SERVICE_NAME);
    }


    // tự động gửi tbao nhắc nhỡ mỗi 1h
    // @Cron(CronExpression.EVERY_30_SECONDS, { name: 'sendRemindersCron', timeZone: 'UTC' })
    async sendReminders(): Promise<void> {
        try {
            const now = new Date();
            const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Lấy các event bắt đầu trong 24h tới, có trạng thái "SCHEDULED" và chưa được gửi reminder
            const events = await this.eventModel.find({
                startDate: { $gte: now, $lte: next24h },
                status: 'SCHEDULED',
                reminderSent: { $ne: true },
            }).exec();

            this.logger.log(`Found ${events.length} event(s) starting within 24 hours that haven't been reminded.`);

            for (const event of events) {
                let registeredEmails: string[] = [];
                try {
                    const participantsResponse = await lastValueFrom(
                        this.ticketService.getUserParticipationByEventId({ eventId: event.id })
                    );
                    if (participantsResponse && participantsResponse.participants) {
                        registeredEmails = participantsResponse.participants
                            .map(p => p.email)
                            .filter(email => email && email.trim().length > 0);
                    }
                } catch (err) {
                    this.logger.error('Error fetching registered participants:', err);
                }

                // Lấy danh sách email của những người được mời (invitedUsers)
                const invitedUsers = await this.invitedUserModel.find({ eventId: event.id }).exec();
                const invitedEmails = invitedUsers
                    .map(u => u.email)
                    .filter(email => email && email.trim().length > 0);

                // Hợp nhất và loại bỏ email trùng
                const allEmails = Array.from(new Set([...registeredEmails, ...invitedEmails]));

                if (allEmails.length === 0) {
                    this.logger.warn(`No invited/registered users found for event ${event.name}`);
                    continue;
                }

                const payload = {
                    emails: allEmails,
                    eventName: event.name,
                    eventStartTime: moment(event.startDate).format('MMMM Do YYYY, h:mm a'),
                    eventEndTime: moment(event.endDate).format('MMMM Do YYYY, h:mm a'),
                    location: event.location,
                    eventDescription: event.description || '',
                };

                // Emit event reminder
                this.clientNotification.emit('send_reminder', payload);
                this.logger.log(`Emitted reminder for event ${event.name}`);

                // Cập nhật trường reminderSent = true cho event này
                await this.eventModel.findByIdAndUpdate(event.id, { reminderSent: true });
            }
        } catch (error) {
            this.logger.error('Error in sendReminders', error);
        }
    }

    async sendEventInvites(request: SendEventInvitesRequest): Promise<SendEventInvitesResponse> {
        try {
            const { users } = request;
            const { event } = request.event;
            let listUsers: UserTypeInvite[] = [];
            for (const user of users) {
                const existingInvitedUser = await this.invitedUserModel.findOne({
                    eventId: event.id,
                    email: user.email,
                });

                if (!existingInvitedUser) {
                    listUsers.push({
                        email: user.email,
                        id: user.id,
                    });
                    const invitedUser = new this.invitedUserModel({
                        eventId: event.id,
                        email: user.email,
                        status: 'pending',
                        userId: user.id,
                    });

                    await invitedUser.save();
                }
            }
            this.clientNotification.emit('send_invites', { users: listUsers, event });

            return {
                message: 'Invitations sent successfully',
                success: true,
            };
        } catch (error) {
            throw handleRpcException(error, 'Failed to send event invites');
        }
    }

    async getParticipantByEventAndUser(eventId: string, userId: string){
        try {
            const participant = await this.ticketService.getParticipantIdByUserIdEventId({ userId, eventId }).toPromise();
            return participant;
        } catch (error) {
            throw handleRpcException(error, 'Failed to get participant by event and user');
        }
    }

    async acceptInvitation(eventId: string, token: string) {
        try {
            const event = await this.eventModel.findById(eventId).exec();
            // Xác thực JWT token
            const decode: { email: string; eventId: string, userId: string }
                = await this.jwtService.verify(token);

            const { email: userEmail, eventId: decodedEventId, userId } = decode;

            if (!userEmail || !decodedEventId) {
                throw new RpcException({
                    message: 'Invalid token or missing information',
                    code: HttpStatus.BAD_REQUEST,
                });
            }

            // Kiểm tra xem eventId trong token có khớp với eventId trong request không
            if (eventId !== decodedEventId) {
                throw new RpcException({
                    message: 'Invalid token for this event',
                    code: HttpStatus.BAD_REQUEST,
                });
            }

            const invitedUser = await this.invitedUserModel.findOne({
                email: userEmail,
                eventId: eventId,
            });

            if (!invitedUser) {
                throw new RpcException({
                    message: 'Invitation not found or invalid',
                    code: HttpStatus.NOT_FOUND,
                });
            }

            if (invitedUser.status === 'pending') {
                invitedUser.status = 'accepted';
                await invitedUser.save();
                await this.decreaseMaxParticipant(eventId);

                this.clientTicket.emit('accepted_invite', {
                    eventId: eventId,
                    userId: userId,
                });
            }

            return {
                message: 'Invitation accepted successfully. Please check QR code in website.',
                success: true,
                event,
            };
        } catch (error) {
            console.error('Failed to accept invitation:', error);
            throw handleRpcException(error, 'Failed to accept invitation');
        }
    }

    async declineInvitation(eventId: string, token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            const { email: userEmail, eventId: decodedEventId } = decoded;

            if (!userEmail || !decodedEventId) {
                throw new Error('Invalid token or missing information.');
            }

            // Kiểm tra xem eventId trong token có khớp với eventId trong request không
            if (eventId !== decodedEventId) {
                throw new Error('Invalid token for this event.');
            }

            const invitedUser = await this.invitedUserModel.findOne({
                email: userEmail,
                eventId: eventId
            });

            if (!invitedUser) {
                throw new Error('Invitation not found or invalid.');
            }

            if (invitedUser.status === 'pending') {
                invitedUser.status = 'declined';
                await invitedUser.save();
            }

            return {
                message: 'Invitation declined successfully',
                success: true,
            };
        } catch (error) {
            console.error('Failed to decline invitation:', error);
            throw handleRpcException(error, 'Failed to decline invitation');
        }
    }

    async submitFeedback(eventId: string, userId: string, rating: number, comment: string) {
        try {
            // Kiểm tra xem event có tồn tại và đã kết thúc chưa
            const event = await this.eventModel.findById(eventId);
            const currentDate = new Date();
            const eventEndDate = new Date(event.endDate);
            if (currentDate < eventEndDate) {
                throw new RpcException({ message: 'Event has not ended yet', code: HttpStatus.BAD_REQUEST });
            }
            return await this.feedbackService.createFeedback(eventId, userId, rating, comment);
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getEventFeedbacks(eventId: string) {
        try {
            return await this.feedbackService.getFeedbacks(eventId);
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getFeedbackAnalysis(eventId: string) {
        try {
            const result = await this.feedbackService.getFeedbacks(eventId);
            const feedbacks = result.feedbacks;
            if (!feedbacks || feedbacks.length === 0) {
                return {
                    eventId,
                    averageRating: 0,
                    totalFeedbacks: 0,
                    ratingDistribution: {},
                };
            }
            const totalFeedbacks = feedbacks.length;
            const sumRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
            const averageRating = sumRating / totalFeedbacks;
            const ratingDistribution: { [key: number]: number } = {};
            feedbacks.forEach(fb => {
                ratingDistribution[fb.rating] = (ratingDistribution[fb.rating] || 0) + 1;
            });
            return {
                eventId,
                averageRating,
                totalFeedbacks,
                ratingDistribution,
            };
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async createQuestion(eventId: string, userId: string, text: string) {
        const event = await this.eventModel.findById(eventId);
        if (!event) {
            throw new RpcException({ message: 'Event not found', code: HttpStatus.NOT_FOUND });
        }
        const question = new this.questionModel({
            eventId: event._id,
            userId,
            text,
            answers: [],
        });
        await question.save();
        return { question: this.transformQuestion(question) };
    }

    async answerQuestion(questionId: string, userId: string, text: string): Promise<{ question: any }> {
        const question = await this.questionModel.findById(questionId);
        if (!question) {
            throw new RpcException({ message: 'Question not found', code: HttpStatus.NOT_FOUND });
        }
        question.answers.push({ userId: new Types.ObjectId(userId), text, createdAt: new Date() });
        question.answers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        await question.save();
        return { question: this.transformQuestion(question) };
    }

    async getEventQuestions(eventId: string): Promise<{ questions: any[] }> {
        const questions = await this.questionModel.find({ eventId: new Types.ObjectId(eventId) }).sort({ createdAt: 1 }).exec();
        const transformed = questions.map(q => {
            q.answers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            return this.transformQuestion(q);
        });
        return { questions: transformed };
    }

    transformQuestion(question: QuestionDocument) {
        return {
            id: question._id.toString(),
            eventId: question.eventId.toString(),
            userId: question.userId.toString(),
            text: question.text,
            createdAt: question.createdAt.toISOString(),
            updatedAt: question.updatedAt.toISOString(),
            answers: question.answers.map(answer => ({
                userId: answer.userId.toString(),
                text: answer.text,
                createdAt: answer.createdAt.toISOString(),
            })),
        };
    }

    async getParticipatedEvents(userId: string, status?: string) {
        try {
            const participantPerEvent = await lastValueFrom(
                this.clientTicket.send('getParticipant', {
                    query: {
                        userId: userId,
                    },
                } as QueryParamsRequest),
            );
            if (
                !participantPerEvent ||
                !Array.isArray(participantPerEvent) ||
                participantPerEvent.length === 0
            ) {
                return {
                    meta: { page: 1, limit: null, totalPages: 1, totalItems: 0, count: 0 },
                    events: []
                };
            }

            const eventIds = participantPerEvent.map((participant) => participant.eventId);

            const events = await this.eventModel.find({
                _id: { $in: eventIds },
                ...(status && { status }),
            });

            return {
                meta:
                {
                    page: 1,
                    limit: null,
                    totalPages: 1,
                    totalItems: events.length,
                    count: events.length
                },
                events: events.map(event => this.transformEvent(event)),
            }
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getOrganizedEvents(userId: string, status?: string) {
        try {
            const query: any = {
                'createdBy.id': userId,
                ...(status && { status }),
            };

            const events = await this.eventModel.find(query);
            return {
                meta: { page: 1, limit: null, totalPages: 1, totalItems: events.length, count: events.length },
                events: events.map(event => this.transformEvent(event))
            };
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async decreaseMaxParticipant(eventId: string) {
        try {
            const event = await this.eventModel.findById(eventId);
            if (event.maxParticipants <= 0) {
                throw new RpcException({
                    message: 'Event was full',
                    code: HttpStatus.BAD_REQUEST,
                });
            }
            else if (event.maxParticipants > 0) {
                event.maxParticipants -= 1;
                await event.save();
            }
            return { message: 'Max participant decreased' };
        } catch (error) {
            throw handleRpcException(error, 'Failed to decrease max participant');
        }
    }

    async increaseMaxParticipant(eventId: string) {
        try {
            const event = await this.eventModel.findById(eventId);
            event.maxParticipants += 1;
            await event.save();
            return { message: 'Max participant increased' };
        } catch (error) {
            throw handleRpcException(error, 'Failed to increase max participant');
        }
    }

    async checkOwnership(eventId: string, userId: string) {
        const event = await this.eventModel
            .findById(eventId)
            .select('createdBy')
            .lean();
        return { isOwner: event.createdBy.id.toString() === userId };
    }

    async cancelEvent(request: CancelEventRequest) {
        try {
            const event = await this.eventModel.findById(request.id);
            if (event.status === 'CANCELED' || event.status === 'FINISHED') {
                throw new RpcException({
                    message: 'Event has been canceled or finished',
                    code: HttpStatus.BAD_REQUEST,
                });
            }
            if (event.createdBy.id.toString() !== request.userId) {
                throw new RpcException({
                    message: 'You are not authorized to cancel this event',
                    code: HttpStatus.FORBIDDEN,
                });
            }
            event.status = 'CANCELED';
            await event.save();
            this.clientTicket.emit('cancelEvent', { eventId: request.id });
            // Gửi thông báo hủy sự kiện
            const participantsResponse = await lastValueFrom(
                this.ticketService.getUserParticipationByEventId({ eventId: request.id })
            );
            if (participantsResponse && participantsResponse.participants) {

                const eventNotificationPayload = {
                    ...event.toObject(),
                    participantsResponse
                };

                this.clientNotification.emit('event_canceled', { event: eventNotificationPayload });
            }

            return { message: 'Event canceled successfully' };
        } catch (error) {
            throw handleRpcException(error, 'Failed to cancel event');
        }
    }

    async getAllEvent(request: { query: { [key: string]: string } }) {
        try {
            const { filter = {}, limit = 10, sort = {} } = aqp(request.query || {});

            const page = parseInt(filter.page || '1', 10);
            delete filter.page;

            if (filter.category) {
                const foundCategory = await this.categoryModel.findOne({
                    name: filter.category.toLowerCase(),
                });
                if (foundCategory) {
                    filter.categoryId = foundCategory._id;
                }
                delete filter.category;
            }

            const parsedLimit = parseInt(limit as any, 10) || 10;
            const skip = (page - 1) * parsedLimit;

            const totalItems = await this.eventModel.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / parsedLimit);

            const events = await this.eventModel
                .find(filter)
                .skip(skip)
                .limit(parsedLimit)
                .sort(sort as any)
                .exec();

            const eventResponses = events.map((event) => this.transformEvent(event));

            return {
                meta: {
                    page,
                    limit: parsedLimit,
                    totalPages,
                    totalItems,
                    count: events.length,
                },
                events: eventResponses,
            };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get all event');
        }
    }

    async getEventById(request: { id: string }): Promise<EventResponse> {
        try {
            const event = await this.eventModel
                .findById(request.id)
                .populate('guestIds')
                .populate({
                    path: 'invitedUsers.user',
                    select: 'name email',
                })
                .populate({
                    path: 'schedule',
                    populate: { path: 'speakerIds', model: 'Speaker' },
                })
                .exec();

            if (!event) {
                throw new RpcException({ message: 'Event not found', code: HttpStatus.NOT_FOUND });
            }

            return { event: this.transformEvent(event) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get event by id');
        }
    }

    async createEvent(request: CreateEventRequest, isExistCategory: any) {
        try {
            if (!isExistCategory) {
                throw new RpcException({
                    message: 'Category not found',
                    code: HttpStatus.NOT_FOUND,
                });
            }
            const event = await this.eventModel.create(request);
            return { event: this.transformEvent(event) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to create event');
        }
    }

    async isExistEvent(id: string) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new RpcException({
                    message: 'Invalid event ID',
                    code: HttpStatus.BAD_REQUEST,
                });
            }
            const event = await this.eventModel.findById(id);
            return { isExist: !!event };
        } catch (error) {
            throw handleRpcException(error, 'Failed to check event');
        }
    }

    async updateEvent(request: UpdateEventRequest): Promise<EventResponse> {
        try {
            const oldEvent = await this.eventModel.findById(request.id);
            if (!oldEvent) {
                throw new RpcException({ message: 'Event not found', code: HttpStatus.NOT_FOUND });
            }
            const oldStatus = oldEvent.status;

            const criticalFields = ['location', 'startDate', 'endDate', 'schedule'];
            const updatedFields: Record<string, { old: string, new: string }> = {};

            for (const field of criticalFields) {
                if (request[field] !== undefined) {
                    if (field === 'startDate' || field === 'endDate') {
                        const oldVal = new Date(oldEvent[field]).toISOString();
                        const newVal = new Date(request[field]).toISOString();
                        if (oldVal !== newVal) {
                            updatedFields[field] = { old: oldVal, new: newVal };
                        }
                    } else if (field === 'schedule') {
                        const oldSchedule = JSON.stringify(oldEvent.schedule);
                        const newSchedule = JSON.stringify(request.schedule);
                        if (oldSchedule !== newSchedule) {
                            updatedFields[field] = { old: oldSchedule, new: newSchedule };
                        }
                    } else {
                        if (oldEvent[field] !== request[field]) {
                            updatedFields[field] = { old: oldEvent[field], new: request[field] };
                        }
                    }
                }
            }

            const updated = await this.eventModel.findByIdAndUpdate(request.id, request, { new: true });
            if (!updated) {
                throw new RpcException({ message: 'Failed to update event', code: HttpStatus.BAD_REQUEST });
            }

            if (Object.keys(updatedFields).length > 0) {
                let registeredEmails: string[] = [];
                try {
                    const participantsResponse = await lastValueFrom(
                        this.ticketService.getUserParticipationByEventId({ eventId: request.id })
                    );
                    if (participantsResponse && participantsResponse.participants) {
                        registeredEmails = participantsResponse.participants
                            .map(p => p.email)
                            .filter(email => email && email.trim().length > 0);
                    }
                } catch (err) {
                    console.error('Error fetching registered participants:', err);
                }

                // Lấy danh sách email của những người được mời (invitedUsers)
                const invitedUsers = await this.invitedUserModel.find({ eventId: request.id }).exec();
                const invitedEmails = invitedUsers
                    .map(u => u.email)
                    .filter(email => email && email.trim().length > 0);

                // Hợp nhất và loại bỏ email trùng
                const allEmails = Array.from(new Set([...registeredEmails, ...invitedEmails]));

                const eventUrl = `https://yourdomain.com/events/${updated._id}`;

                if (allEmails.length > 0) {
                    const eventNotificationPayload = {
                        ...updated.toObject(),
                        updatedFields, // object chứa chi tiết các thay đổi
                        registeredEmails: allEmails,
                        eventUrl,
                        currentYear: new Date().getFullYear(),
                    };

                    this.clientNotification.emit('event_update', { event: eventNotificationPayload });
                }
            }

            // feedback
            if (oldStatus !== 'FINISHED' && updated.status === 'FINISHED') {
                await this.sendFeedbackInvites(updated);
            }

            const populatedEvent = await this.populateInvitedUsers(updated);
            return { event: populatedEvent };
        } catch (error) {
            throw handleRpcException(error, 'Failed to update event');
        }
    }

    private async populateInvitedUsers(event: EventDocument): Promise<EventType> {
        const transformed = this.transformEvent(event);
        const invitedUsers = await this.invitedUserModel.find({ eventId: event._id.toString() });
        transformed.invitedUsers = invitedUsers.map(iu => ({
            userId: iu.userId ? iu.userId.toString() : "",
            id: iu._id.toString(),
            email: iu.email,
            status: iu.status
        }));
        return transformed;
    }

    private async sendFeedbackInvites(event: EventDocument) {
        try {
            const request: GetParticipantByEventIdRequest = { eventId: event._id.toString() };
            const resp = await lastValueFrom(
                this.ticketService.getParticipantByEventId(request),
            );

            const checkined = resp.participants.filter((p) => p.checkInAt);

            const emails = checkined.map((p) => p.email).filter((e) => !!e);

            if (emails.length > 0) {
                this.clientNotification.emit('send_feedback_invitation', {
                    emails,
                    eventName: event.name,
                    eventId: event._id.toString(),
                });
            }
        } catch (error) {
            console.error('Failed to send feedback invites:', error);
        }
    }

    private transformEvent(event: EventDocument): EventType {
        const obj = event.toObject({ virtuals: true, getters: true });
        return {
            id: obj._id.toString(),
            name: obj.name,
            description: obj.description,
            startDate: obj.startDate,
            endDate: obj.endDate,
            location: obj.location,
            banner: obj.banner,
            videoIntro: obj.videoIntro,
            documents: obj.documents,
            maxParticipants: obj.maxParticipants,
            guestIds: obj.guestIds,
            categoryId: obj.categoryId,
            // schedule: obj.schedule.map((item) => ({
            //     ...item,
            //     speakerIds: item.speakerIds.map((speaker) => speaker.toObject ? speaker.toObject() : speaker
            //     ),
            // })),
            schedule: obj.schedule,
            createdBy: obj.createdBy,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt,
            sponsors: obj.sponsors,
            budget: obj.budget,
            status: obj.status,
            invitedUsers: []
        };
    }
}
