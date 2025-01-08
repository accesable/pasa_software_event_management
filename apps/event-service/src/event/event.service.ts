import { handleRpcException } from '@app/common/filters/handleException';
import { CancelEventRequest, CreateEventRequest, EventResponse, EventType, SendEventInvitesRequest, SendEventInvitesResponse, UpdateEventRequest } from '@app/common/types/event';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { CategoryDocument, EventCategory } from 'apps/event-service/src/event-category/schemas/event-category.schema';
import { EventDocument } from 'apps/event-service/src/event/schemas/event.schema';
import { InvitedUser, InvitedUserDocument } from 'apps/event-service/src/event/schemas/invite.schema';
import { Question, QuestionDocument } from 'apps/event-service/src/event/schemas/question.schema';
import { Model } from 'mongoose';

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
            const { filter, limit, sort } = aqp(request.query);

            const page = parseInt(filter.page, 10);
            delete filter.page;

            // let population: any[] = [];
            // if (filter.population) {
            //     const popVal = filter.population;

            //     if (typeof popVal === 'string') {
            //         population = popVal.split(',').map((field: string) => {
            //             const trimmedField = field.trim();
            //             if (trimmedField === 'schedule.speakerIds') {
            //                 return { path: trimmedField, model: 'Speaker' };
            //             }
            //             return { path: trimmedField };
            //         });
            //     }

            //     else if (Array.isArray(popVal) || (popVal['$in'] && Array.isArray(popVal['$in']))) {
            //         const fields = Array.isArray(popVal) ? popVal : popVal['$in'];
            //         population = fields.map((field: string) => {
            //             const trimmedField = field.trim();
            //             if (trimmedField === 'schedule.speakerIds') {
            //                 return { path: trimmedField, model: 'Speaker' };
            //             }
            //             return { path: trimmedField };
            //         });
            //     }

            //     delete filter.population;
            // }


            if (filter.category) {
                const foundCategory = await this.categoryModel.findOne({
                    name: filter.category.toLowerCase(),
                });
                if (foundCategory) {
                    filter.categoryId = foundCategory._id;
                }
                delete filter.category;
            }

            const parsedLimit = limit;
            const skip = (page - 1) * parsedLimit;

            const totalItems = await this.eventModel.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / parsedLimit);
            const events = await this.eventModel
                .find(filter)
                .skip(skip)
                .limit(parsedLimit)
                .sort(sort as any)
                // .populate(population) // "guestIds", "categoryId", "schedule.speakerIds"
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
        this.clientTicket.emit('checkEvent', { id: request.id });
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
            const event = await this.eventModel.findOne({ _id: id });
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
