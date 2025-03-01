import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { EventDocument } from './schemas/event.schema';
import { InvitedUser, InvitedUserDocument } from './schemas/invite.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { Model, Types } from 'mongoose';
import { CategoryDocument, EventCategory } from '../event-category/schemas/event-category.schema';
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';
import { SendEventInvitesRequest, SendEventInvitesResponse, CancelEventRequest, EventType, EventResponse, CreateEventRequest, UpdateEventRequest, UserTypeInvite, GetEventFeedbacksResponse, EventByIdRequest, RegistrationCountData, EventRegistrationsOverTimeResponse, GetTotalOrganizedEventsOverTimeRequest, MonthlyEventCount, MonthlyEventCountsResponse, GetEventFeedbacksRequest, GetRegisteredParticipantsResponse } from '../../../../libs/common/src/types/event';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { QueryParamsRequest, USERS_SERVICE_NAME, UsersServiceClient } from '../../../../libs/common/src';
import { lastValueFrom } from 'rxjs';
import { AUTH_SERVICE, TICKET_SERVICE } from '../../../apigateway/src/constants/service.constant';
import { GetParticipantByEventIdRequest, TICKET_SERVICE_PROTO_SERVICE_NAME, TicketServiceProtoClient } from '../../../../libs/common/src/types/ticket';
import { JwtService } from '@nestjs/jwt';
import { FeedbackService } from '../feedback/feedback.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { of } from 'rxjs';

@Injectable()
export class EventService {
    private readonly logger = new Logger(EventService.name);
    private ticketService: TicketServiceProtoClient;
    private authService: UsersServiceClient;
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @Inject(AUTH_SERVICE) private clientAuth: ClientGrpc,
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
        this.authService = this.clientAuth.getService<UsersServiceClient>(USERS_SERVICE_NAME);
    }


    // tự động gửi tbao nhắc nhỡ mỗi 1h
    // @Cron(CronExpression.EVERY_30_SECONDS, { name: 'sendRemindersCron', timeZone: 'UTC' })
    // async sendReminders(): Promise<void> {
    //     try {
    //         const now = new Date();
    //         const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    //         // Lấy các event bắt đầu trong 24h tới, có trạng thái "SCHEDULED" và chưa được gửi reminder
    //         const events = await this.eventModel.find({
    //             startDate: { $gte: now, $lte: next24h },
    //             status: 'SCHEDULED',
    //             reminderSent: { $ne: true },
    //         }).exec();

    //         this.logger.log(`Found ${events.length} event(s) starting within 24 hours that haven't been reminded.`);

    //         for (const event of events) {
    //             let registeredEmails: string[] = [];
    //             try {
    //                 const participantsResponse = await lastValueFrom(
    //                     this.ticketService.getUserParticipationByEventId({ eventId: event.id })
    //                 );
    //                 if (participantsResponse && participantsResponse.participants) {
    //                     registeredEmails = participantsResponse.participants
    //                         .map(p => p.email)
    //                         .filter(email => email && email.trim().length > 0);
    //                 }
    //             } catch (err) {
    //                 this.logger.error('Error fetching registered participants:', err);
    //             }

    //             // Lấy danh sách email của những người được mời (invitedUsers)
    //             const invitedUsers = await this.invitedUserModel.find({ eventId: event.id }).exec();
    //             const invitedEmails = invitedUsers
    //                 .map(u => u.email)
    //                 .filter(email => email && email.trim().length > 0);

    //             // Hợp nhất và loại bỏ email trùng
    //             const allEmails = Array.from(new Set([...registeredEmails, ...invitedEmails]));

    //             if (allEmails.length === 0) {
    //                 this.logger.warn(`No invited/registered users found for event ${event.name}`);
    //                 continue;
    //             }

    //             const payload = {
    //                 emails: allEmails,
    //                 eventName: event.name,
    //                 eventStartTime: moment(event.startDate).format('MMMM Do YYYY, h:mm a'),
    //                 eventEndTime: moment(event.endDate).format('MMMM Do YYYY, h:mm a'),
    //                 location: event.location,
    //                 eventDescription: event.description || '',
    //             };

    //             // Emit event reminder
    //             this.clientNotification.emit('send_reminder', payload);
    //             this.logger.log(`Emitted reminder for event ${event.name}`);

    //             // Cập nhật trường reminderSent = true cho event này
    //             await this.eventModel.findByIdAndUpdate(event.id, { reminderSent: true });
    //         }
    //     } catch (error) {
    //         this.logger.error('Error in sendReminders', error);
    //     }
    // }

    async getParticipantsWithFaces(eventId: string) {
        try {
            const participantsResponse = await this.getRegisteredParticipants(eventId);
            const participants = participantsResponse.participants || [];

            const participantsWithFaces = [];
            for (const participant of participants) {
                const userResponse = await lastValueFrom(
                    await this.authService.getUserWithFaceImages({ id: participant.id })
                );
                const userData = userResponse as { userId: string; faceImages?: string[] };
                if (userData && userData.userId && userData.faceImages && userData.faceImages.length > 0) {
                    participantsWithFaces.push({
                        participantId: participant.participantId,
                        userId: userData.userId,
                        faceImages: userData.faceImages || [],
                    });
                }
            }

            return { participants: participantsWithFaces };
        } catch (error) {
            throw handleRpcException(error, 'No participants found with faces');
        }
    }

    async getUserById(request: { id: string }) {
        try {
            return await this.getEventById(request) as any;
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getRegisteredParticipants(eventId: string): Promise<GetRegisteredParticipantsResponse> {
        try {
            const participantsResponse = await lastValueFrom(
                this.ticketService.getParticipantRegisteredForEvent({ eventId })
            );

            const meta = {
                page: 1,
                limit: null,
                totalPages: 1,
                totalItems: participantsResponse.participants?.length || 0,
                count: participantsResponse.participants?.length || 0,
            };

            return {
                participants: participantsResponse.participants || [],
                meta,
            };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get registered participants');
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
            if (event.status !== 'FINISHED') {
                throw new RpcException({ message: 'Event has not finished yet', code: HttpStatus.BAD_REQUEST });
            }
            return await this.feedbackService.createFeedback(eventId, userId, rating, comment);
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async updateFeedback(eventId: string, userId: string, rating: number, comment: string) {
        try {
            return await this.feedbackService.updateFeedback(eventId, userId, rating, comment);
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getFeedbackByUser(eventId: string, userId: string) {
        try {
            return await this.feedbackService.getFeedbackByUser(eventId, userId);
        } catch (error) {
            throw new RpcException(error);
        }
    }

    // async getEventFeedbacks(eventId: string) {
    //     try {
    //         return await this.feedbackService.getFeedbacks(eventId);
    //     } catch (error) {
    //         throw new RpcException(error);
    //     }
    // }

    async getEventFeedbacks(request: GetEventFeedbacksRequest) { // <-- Sửa function, nhận GetEventFeedbacksRequest
        try {
            const { eventId, query } = request;
            const { filter = {}, limit = 10, sort = {} } = aqp(query as any || {});
            const page = parseInt(filter.page || '1', 10);
            delete filter.page;
            const parsedLimit = parseInt(limit as any, 10) || 10;
            const skip = (page - 1) * parsedLimit;

            const mongoFilter: any = { eventId: eventId }; // Filter theo eventId
            // Thêm các filter khác nếu cần (ví dụ: filter theo rating, comment...)

            const totalItems = await this.feedbackModel.countDocuments(mongoFilter);
            const totalPages = Math.ceil(totalItems / parsedLimit);


            const feedbacks = await this.feedbackModel
                .find(mongoFilter)
                .skip(skip)
                .limit(parsedLimit)
                .sort(sort as any)
                .exec();


            return {
                feedbacks: feedbacks.map(fb => this.transformFeedback(fb)),
                meta: {
                    page,
                    limit: parsedLimit,
                    totalPages,
                    totalItems,
                    count: feedbacks.length,
                },
            };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get event feedbacks');
        }
    }

    transformFeedback(feedback: FeedbackDocument) {
        return {
            id: feedback._id.toString(),
            eventId: feedback.eventId.toString(),
            userId: feedback.userId.toString(),
            rating: feedback.rating,
            comment: feedback.comment,
            createdAt: feedback.createdAt ? feedback.createdAt.toISOString() : '',
            updatedAt: feedback.updatedAt ? feedback.updatedAt.toISOString() : '',
        };
    }

    // async getFeedbackAnalysis(eventId: string) {
    //     try {
    //         const result = await this.feedbackService.getFeedbacks(eventId);
    //         const feedbacks = result.feedbacks;

    //         if (!feedbacks || feedbacks.length === 0) {
    //             return {
    //                 eventId,
    //                 averageRating: 0,
    //                 totalFeedbacks: 0,
    //                 ratingDistribution: {},
    //             };
    //         }

    //         const totalFeedbacks = feedbacks.length;
    //         const sumRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    //         const averageRating = parseFloat((sumRating / totalFeedbacks).toFixed(1));

    //         const ratingDistribution: { [key: string]: number } = {}; // Dùng string làm key
    //         feedbacks.forEach(fb => {
    //             const ratingKey = fb.rating.toFixed(1); // Giữ định dạng float
    //             ratingDistribution[ratingKey] = (ratingDistribution[ratingKey] || 0) + 1;
    //         });

    //         return {
    //             eventId, 
    //             averageRating,
    //             totalFeedbacks,
    //             ratingDistribution,
    //         };
    //     } catch (error) {
    //         throw new RpcException(error);
    //     }
    // }

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
            const averageRating = parseFloat((sumRating / totalFeedbacks).toFixed(1));

            // Replace forEach with reduce for ratingDistribution
            const ratingDistribution = feedbacks.reduce((acc, fb) => {
                const ratingKey = fb.rating.toFixed(1);
                acc[ratingKey] = (acc[ratingKey] || 0) + 1;
                return acc;
            }, {});

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

    async getEventComparisonData() { // <-- Thêm function này
        try {
            const allEvents = await this.eventModel.find().populate('categoryId').exec(); // <-- Populate categoryId
            const eventComparisonDataList = [];

            for (const event of allEvents) {
                const feedbacksResponse = await this.feedbackService.getFeedbacks(event.id);
                const feedbacks = feedbacksResponse.feedbacks || [];
                const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
                const averageRating = feedbacks.length > 0 ? parseFloat((totalRating / feedbacks.length).toFixed(1)) : 0; // Sửa lỗi sumRating và totalFeedbacks

                const participantsResponse = await lastValueFrom(
                    this.ticketService.getParticipantByEventId({ eventId: event.id })
                );
                const registrationCount = participantsResponse.participants?.length || 0;

                eventComparisonDataList.push({
                    eventId: event.id,
                    eventName: event.name,
                    categoryName: ((event.categoryId as unknown) as CategoryDocument)?.name ?? 'Unknown Category',
                    startDate: event.startDate.toISOString(),
                    endDate: event.endDate.toISOString(),
                    location: event.location,
                    registrationCount: registrationCount,
                    averageRating: averageRating,
                    feedbackCount: feedbacks.length,
                    status: event.status,
                });
            }

            return { eventComparisonDataList };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get event comparison data');
        }
    }

    async getEventInvitedUsers(eventId: string) {
        try {
            if (!Types.ObjectId.isValid(eventId)) {
                throw new RpcException({
                    message: 'Invalid event ID',
                    code: HttpStatus.BAD_REQUEST,
                });
            }
            const invitedUsers = await this.invitedUserModel.find({ eventId: eventId }).exec();
            return { invitedUsers: invitedUsers.map(this.transformInvitedUser) }; // Sử dụng transformInvitedUser
        } catch (error) {
            throw handleRpcException(error, 'Failed to get invited users by event id');
        }
    }

    private transformInvitedUser(invitedUser: InvitedUserDocument): any { // <-- Hàm transform mới
        return {
            id: invitedUser._id.toString(),
            eventId: invitedUser.eventId.toString(),
            userId: invitedUser.userId ? invitedUser.userId.toString() : null,
            email: invitedUser.email,
            status: invitedUser.status,
            createdAt: invitedUser.createdAt.toISOString(),
            updatedAt: invitedUser.updatedAt.toISOString(),
        };
    }

    async getTotalEventsOverTime(request: GetTotalOrganizedEventsOverTimeRequest) {
        try {
            const userId = request.userId;
            const participatedEventsResponse = await lastValueFrom(
                await this.getParticipatedEventsForOverTime(userId)
            );
            const participatedEvents = participatedEventsResponse.events || [];
            const monthlyParticipatedEventsCounts = this.aggregateEventsByMonth(participatedEvents, 2025);

            const organizedEventsResponse = await lastValueFrom(
                await this.getOrganizedEventsForTotalOverTime(userId)
            );
            const organizedEvents = organizedEventsResponse.events || [];
            const monthlyOrganizedEventsCounts = this.aggregateEventsByMonth(organizedEvents, 2025);


            const monthlyEventCountsResponse: MonthlyEventCountsResponse = {
                monthlyOrganizedEvents: monthlyOrganizedEventsCounts.map(({ month, count }) => ({ month, count })), // Map về kiểu MonthlyEventCount
                monthlyParticipatedEvents: monthlyParticipatedEventsCounts.map(({ month, count }) => ({ month, count })), // Map về kiểu MonthlyEventCount
            };
            return monthlyEventCountsResponse;

        } catch (error) {
            throw handleRpcException(error, 'Failed to get total participated events over time');
        }
    }

    async getParticipatedEventsForOverTime(userId: string, status?: string) { // Thay đổi return type thành Observable<AllEventResponse>
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
                const emptyResponseData = { // Tạo response data object
                    meta: { page: 1, limit: null, totalPages: 1, totalItems: 0, count: 0 },
                    events: []
                };
                return of(emptyResponseData); // Wrap emptyResponseData trong of() và return Observable
            }

            const eventIds = participantPerEvent.map((participant) => participant.eventId);

            const events = await this.eventModel.find({
                _id: { $in: eventIds },
                ...(status && { status }),
            });

            const responseData = { // Tạo response data object
                meta:
                {
                    page: 1,
                    limit: null,
                    totalPages: 1,
                    totalItems: events.length,
                    count: events.length
                },
                events: events.map(event => this.transformEvent(event)),
            };
            return of(responseData); // Wrap responseData trong of() và return Observable
        } catch (error) {
            throw new RpcException(error);
        }
    }

    private aggregateEventsByMonth(events: any[], year: number): MonthlyEventCount[] {
        // Tạo mảng chứa tất cả 12 tháng của năm
        const allMonths = Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            return moment({ year, month: month - 1 }).format('YYYY-MM'); // Format month YYYY-MM
        });

        // Group events theo tháng như trước
        const groupedEvents = _(events)
            .groupBy(event => moment(event.startDate).format('YYYY-MM'))
            .value();

        // Map qua tất cả 12 tháng và trả về count, default 0 nếu không có event trong tháng
        return allMonths.map(month => ({
            month,
            count: groupedEvents[month]?.length || 0, // Default count = 0 nếu không có event trong tháng
        }));
    }

    async getEventRegistrationsOverTime(request: EventByIdRequest): Promise<EventRegistrationsOverTimeResponse> {
        try {
            const eventId = request.id;
            const participantsResponse = await lastValueFrom(
                this.ticketService.getParticipantByEventId({ eventId })
            );
            const participants = participantsResponse.participants || [];

            const registrationData = participants.map(p => ({
                date: moment(p.createdAt).format('YYYY-MM-DD'), // Sử dụng p.createdAt (đã có trong DataResultCheckInOut)
                count: 1
            }));

            const groupedData = _.groupBy(registrationData, 'date');
            const registrationCounts: RegistrationCountData[] = Object.keys(groupedData).map(date => ({
                date,
                registrations: groupedData[date].length
            }));

            return { registrationCounts };

        } catch (error) {
            throw handleRpcException(error, 'Failed to get event registrations over time');
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

    async getOrganizedEventsForTotalOverTime(userId: string) {
        try {
            const query: any = {
                'createdBy.id': userId,
            };

            const events = await this.eventModel.find(query);
            const responseData = {
                meta: { page: 1, limit: null, totalPages: 1, totalItems: events.length, count: events.length },
                events: events.map(event => this.transformEvent(event))
            };
            return of(responseData);
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
            const parsedLimit = parseInt(limit as any, 10) || 10;

            const mongoFilter: any = {};

            if (filter.status) {
                mongoFilter.status = filter.status;
            }

            if (filter.categoryId) {
                const foundCategory = await this.categoryModel.findById(filter.categoryId).exec();
                if (foundCategory) {
                    mongoFilter.categoryId = filter.categoryId;
                } else {
                    return { // Nếu không tìm thấy category, trả về empty result
                        meta: { page, limit: parsedLimit, totalPages: 1, totalItems: 0, count: 0 },
                        events: []
                    };
                }
                delete filter.categoryId;
            }
            delete filter.category;

            if (filter.search) {
                mongoFilter.name = { $regex: filter.search, $options: 'i' };
                delete filter.search;
            }
            const skip = (page - 1) * parsedLimit;

            const totalItems = await this.eventModel.countDocuments(mongoFilter);
            const totalPages = Math.ceil(totalItems / parsedLimit);

            const events = await this.eventModel
                .find(mongoFilter)
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
                .populate({
                    path: 'invitedUsers.user',
                    select: 'name email',
                })
                .populate({
                    path: 'schedule',
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
            if (oldEvent.status === 'FINISHED') {
                throw new RpcException({ message: 'Event has been finished', code: HttpStatus.BAD_REQUEST });
            }
            const oldStatus = oldEvent.status;

            const criticalFields = ['location', 'startDate', 'endDate'];
            const updatedFields: Record<string, { old: string, new: string }> = {};

            for (const field of criticalFields) {
                if (request[field] !== undefined) {
                    if (field === 'startDate' || field === 'endDate') {
                        const oldVal = new Date(oldEvent[field]).toISOString();
                        const newVal = new Date(request[field]).toISOString();
                        if (oldVal !== newVal) {
                            updatedFields[field] = { old: oldVal, new: newVal };
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


                if (allEmails.length > 0) {
                    const eventNotificationPayload = {
                        ...updated.toObject(),
                        updatedFields, // object chứa chi tiết các thay đổi
                        registeredEmails: allEmails,
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
