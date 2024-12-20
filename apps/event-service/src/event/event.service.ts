import { handleRpcException } from '@app/common/filters/handleException';
import { CreateEventRequest, EventType, UpdateEventRequest } from '@app/common/types/event';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { EventDocument } from 'apps/event-service/src/event/schemas/event.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    ) { }

    async getAllEvent(query: any) {
        try {
            const { filter, limit, sort } = aqp(query);
            const page = parseInt(filter.page || '1', 10);
            delete filter.page;
            console.log(filter);
            const population = filter.population?.split(',').map(field => ({ path: field.trim() }));
            const skip = (page - 1) * (limit || 10);
            const totalItems = await this.eventModel.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / limit);

            const events = await this.eventModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort(sort as any)
                .populate(population)
                .exec();

            const eventResponses: EventType[] = events.map((event) => this.transformEvent(event));
            return {
                meta: {
                    page,
                    limit,
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

    transformEvent(event: EventDocument): EventType {
        const schedule = event.schedule?.map(session => ({
            title: session.title,
            startTime: session.startTime ? session.startTime.toISOString() : '',
            endTime: session.endTime ? session.endTime.toISOString() : '',
            description: session.description || '',
            speakerIds: session.speakerIds?.map(sid => sid.toString()) || []
        })) || [];

        const guestIds = event.guestIds?.map(g => g.toString()) || [];

        const sponsors = event.sponsors?.map(s => ({
            name: s.name || '',
            logo: s.logo || '',
            website: s.website || '',
            contribution: s.contribution || 0
        })) || [];

        const budget = event.budget ? {
            totalBudget: event.budget.totalBudget || 0,
            expenses: event.budget.expenses?.map(e => ({
                desc: e.desc || '',
                amount: e.amount || 0,
                date: e.date ? e.date.toISOString() : ''
            })) || [],
            revenue: event.budget.revenue?.map(r => ({
                desc: r.desc || '',
                amount: r.amount || 0,
                date: r.date ? r.date.toISOString() : ''
            })) || []
        } : { totalBudget: 0, expenses: [], revenue: [] };

        return {
            id: event._id.toString(),
            name: event.name || '',
            description: event.description || '',
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            location: event.location || '',
            schedule,
            guestIds,
            categoryId: event.categoryId.toString(),
            isFree: event.isFree,
            price: event.price,
            maxParticipants: event.maxParticipants,
            banner: event.banner || '',
            videoIntro: event.videoIntro || '',
            documents: event.documents || [],
            status: event.status,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
            createdBy: event.createdBy.toString(),
            sponsors,
            budget
        };
    }
}
