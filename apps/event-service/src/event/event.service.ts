import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { EventDocument } from './schemas/event.schema';
import { InvitedUser, InvitedUserDocument } from './schemas/invite.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { Model, Types } from 'mongoose';
import { CategoryDocument, EventCategory } from '../event-category/schemas/event-category.schema';
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';
import { SendEventInvitesRequest, SendEventInvitesResponse, CancelEventRequest, EventType, EventResponse, CreateEventRequest, UpdateEventRequest } from '../../../../libs/common/src/types/event';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(EventCategory.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(InvitedUser.name) private invitedUserModel: Model<InvitedUserDocument>,
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,

        @Inject('TICKET_SERVICE') private readonly clientTicket: ClientProxy,
        @Inject('NOTIFICATION_SERVICE') private readonly clientNotification: ClientProxy,
    ) { }

    // async acceptInvitation(request: AcceptInvitationRequest) {
    //     try {
    //         // Xử lý logic chấp nhận lời mời, cập nhật trạng thái trong database
    //     } catch (error) {
    //         throw handleRpcException(error, 'Failed to accept invitation');
    //     }
    // }

    // async declineInvitation(request: DeclineInvitationRequest) {
    //     try {
    //         // Xử lý logic từ chối lời mời, cập nhật trạng thái trong database
    //     } catch (error) {
    //         throw handleRpcException(error, 'Failed to decline invitation');
    //     }
    // }

    async decreaseMaxParticipant(eventId: string) {
        try {
            const event = await this.eventModel.findById(eventId);
            if (event.maxParticipants > 0) {
                event.maxParticipants -= 1;
                await event.save();
            }
            return { message: 'Max participant decreased' };
        } catch (error) {
            throw handleRpcException(error, 'Failed to decrease max participant');
        }
    }

    async sendEventInvites(
        request: SendEventInvitesRequest,
    ): Promise<SendEventInvitesResponse> {
        try {
            const event = await this.eventModel.findById(request.eventId);
            const { emails } = request;
            this.clientNotification.emit('sendInvites', { emails, event });
            return {
                message: 'Invitations sent successfully',
                success: true,
            };
        } catch (error) {
            throw handleRpcException(error, 'Failed to send event invites');
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

    async getAllEventByCategoryName(id: string) {
        try {
            const events = await this.eventModel.find({ categoryId: id });
            const eventResponses: EventType[] = events.map(event => this.transformEvent(event));
            return { events: eventResponses };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get all event by category name');
        }
    }

    async getEventById(
        request: any,
    ): Promise<EventResponse> {
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

            return {
                event: this.transformEvent(event),
            };
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

    async updateEvent(request: UpdateEventRequest) {
        try {
            const event = await this.eventModel.findByIdAndUpdate
                (request.id, request, { new: true });
            return { event: this.transformEvent(event) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to update event');
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
