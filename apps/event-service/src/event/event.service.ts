import { handleRpcException } from '@app/common/filters/handleException';
import { CreateEventRequest, EventType, UpdateEventRequest } from '@app/common/types/event';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { CategoryDocument, EventCategory } from 'apps/event-service/src/event-category/schemas/event-category.schema';
import { EventDocument } from 'apps/event-service/src/event/schemas/event.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(EventCategory.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    async getAllEvent(request: { query: { [key: string]: string } }) {
        try {
            const { filter, limit, sort } = aqp(request.query);

            const page = parseInt(filter.page, 10);
            delete filter.page;

            let population: any[] = [];
            if (filter.population) {
                const popVal = filter.population;

                if (typeof popVal === 'string') {
                    population = popVal.split(',').map((field: string) => {
                        const trimmedField = field.trim();
                        if (trimmedField === 'schedule.speakerIds') {
                            return { path: trimmedField, model: 'Speaker' };
                        }
                        return { path: trimmedField };
                    });
                }

                else if (Array.isArray(popVal) || (popVal['$in'] && Array.isArray(popVal['$in']))) {
                    const fields = Array.isArray(popVal) ? popVal : popVal['$in'];
                    population = fields.map((field: string) => {
                        const trimmedField = field.trim();
                        if (trimmedField === 'schedule.speakerIds') {
                            return { path: trimmedField, model: 'Speaker' };
                        }
                        return { path: trimmedField };
                    });
                }

                delete filter.population;
            }


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
                .populate(population) // "guestIds", "categoryId", "schedule.speakerIds"
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

    async getEventById(id: string) {
        try {
            const event = await this.eventModel.findById(id);
            if (!event) {
                throw new RpcException({
                    message: 'Event not found',
                    code: HttpStatus.NOT_FOUND,
                });
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

    async updateEvent(request: UpdateEventRequest) {
        try {
            const event = await this.eventModel.findByIdAndUpdate
                (request.id, request, { new: true });
            return { event: this.transformEvent(event) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to update event');
        }
    }

    private transformEvent(event: EventDocument) {
        const obj = event.toObject({ virtuals: true, getters: true });
        return {
            id: obj._id.toString(),
            name: obj.name,
            description: obj.description,
            startDate: obj.startDate,
            endDate: obj.endDate,
            location: obj.location,
            guestIds: obj.guestIds,
            categoryId: obj.categoryId,
            schedule: obj.schedule.map((item) => ({
                ...item,
                speakerIds: item.speakerIds.map((speaker) =>
                    speaker.toObject ? speaker.toObject() : speaker
                ),
            })),
            createdBy: obj.createdBy,
            isFree: obj.isFree,
            price: obj.price,
            maxParticipants: obj.maxParticipants,
            banner: obj.banner,
            videoIntro: obj.videoIntro,
            documents: obj.documents,
            status: obj.status,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt,
            sponsors: obj.sponsors,
            budget: obj.budget,
        };
    }
}
