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
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { QueryParamsRequest } from '../../../../libs/common/src';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(EventCategory.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(InvitedUser.name) private invitedUserModel: Model<InvitedUserDocument>,
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
        @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
        @Inject('TICKET_SERVICE') private readonly clientTicket: ClientProxy,
        @Inject('NOTIFICATION_SERVICE') private readonly clientNotification: ClientProxy,
    ) { }

    // async acceptInvitation(eventId: string, query: any) {
    //     try {
    //         const token = query.token;
    //         const acceptResult = await lastValueFrom(
    //             this.eventService.acceptInvitation({ eventId, token }),
    //         );
    //         return acceptResult;
    //     } catch (error) {
    //         throw new RpcException(error);
    //     }
    // }

    // async declineInvitation(eventId: string, query: any) {
    //     try {
    //         const token = query.token;
    //         const declineResult = await lastValueFrom(
    //             this.eventService.declineInvitation({ eventId, token }),
    //         );
    //         return declineResult;
    //     } catch (error) {
    //         throw new RpcException(error);
    //     }
    // }
    // async createQuestion(
    //     eventId: string,
    //     question: string,
    //     user: DecodeAccessResponse,
    // ) {
    //     try {
    //         // Fetch the user data based on the user's ID
    //         const userResponse = await lastValueFrom(
    //             this.usersService.findById({ id: user.id }),
    //         );

    //         // If user data is not found or the ID is missing, throw an exception
    //         if (!userResponse || !userResponse.id) {
    //             throw new RpcException('User not found or invalid user data');
    //         }
    //         // Make a request to the event service to create a question
    //         const result = await lastValueFrom(
    //             this.eventService.createQuestion({
    //                 eventId,
    //                 question,
    //                 userId: userResponse.id, // Pass the user ID from the authenticated user
    //             }),
    //         );

    //         return result;
    //     } catch (error) {
    //         // Throw any errors that occur during the process
    //         throw new RpcException(error);
    //     }
    // }

    // async getEventQuestions(eventId: string) {
    //     try {
    //         // Make a request to the event service to get all questions for the event
    //         const result = await lastValueFrom(
    //             this.eventService.getEventQuestions({
    //                 eventId,
    //             }),
    //         );

    //         return result;
    //     } catch (error) {
    //         throw new RpcException(error);
    //     }
    // }

    // async updateQuestion(
    //     eventId: string,
    //     questionId: string,
    //     answered: boolean,
    //     user: DecodeAccessResponse,
    // ) {
    //     try {
    //         const userResponse = await lastValueFrom(
    //             this.usersService.findById({ id: user.id }),
    //         );

    //         if (!userResponse || !userResponse.id) {
    //             throw new RpcException('User not found or invalid user data');
    //         }
    //         const event = await this.eventService.getEventById({ id: eventId }).toPromise();

    //         // Check if the user is authorized to update this question
    //         if (event.createdBy.id !== userResponse.id) {
    //             throw new RpcException(
    //                 'You are not authorized to update questions for this event',
    //             );
    //         }
    //         const result = await lastValueFrom(
    //             this.eventService.updateQuestion({
    //                 questionId,
    //                 answered,
    //             }),
    //         );
    //         return result;
    //     } catch (error) {
    //         throw new RpcException(error);
    //     }
    // }

    // async createFeedback(
    //     eventId: string,
    //     feedback: string,
    //     rating: number,
    //     user: DecodeAccessResponse,
    // ) {
    //     try {
    //         const event = await lastValueFrom(this.eventService.getEventById({ id: eventId }));

    //         // Kiểm tra xem sự kiện có tồn tại không
    //         if (!event) {
    //             throw new RpcException({
    //                 message: 'Event not found',
    //                 code: HttpStatus.NOT_FOUND,
    //             });
    //         }

    //         // Kiểm tra xem sự kiện đã kết thúc chưa
    //         const currentDate = new Date();
    //         const eventEndDate = new Date(event.event.endDate);

    //         if (currentDate < eventEndDate) {
    //             throw new RpcException({
    //                 message: 'Event has not ended yet',
    //                 code: HttpStatus.BAD_REQUEST,
    //             });
    //         }

    //         const feedbackModel = new this.feedbackModel({
    //             eventId: eventId,
    //             userId: user.id, // Lấy ID của người dùng từ JWT payload
    //             feedback: feedback,
    //             rating: rating
    //         });

    //         await feedbackModel.save();

    //         return { message: 'Feedback created successfully' };
    //     } catch (error) {
    //         console.error('Failed to create feedback:', error);
    //         throw new RpcException({
    //             code: HttpStatus.INTERNAL_SERVER_ERROR,
    //             message: 'Failed to create feedback',
    //         });
    //     }
    // }

    async getEventFeedbacks(eventId: string) {
        try {
            const feedbacks = await this.feedbackModel.find({ eventId: eventId }).exec();

            // Trả về danh sách phản hồi
            return { feedbacks };
        } catch (error) {
            console.error('Failed to fetch event feedbacks:', error);
            throw new RpcException({
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to fetch feedbacks',
            });
        }
    }

    async getParticipatedEvents(userId: string, status?: string) {
        try {
            const participantPerEvent = await lastValueFrom(
                this.clientTicket.send('getParticipant', {
                    query: {
                        userId: userId,
                        status, // Lọc eventId theo status ở event service
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
                    events: [] };
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
