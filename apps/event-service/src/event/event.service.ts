import { handleRpcException } from '@app/common/filters/handleException';
import { CreateEventRequest, EventType, UpdateEventRequest } from '@app/common/types/event';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryDocument, EventCategory } from 'apps/event-service/src/event-category/schemas/event-category.schema';
import { EventDocument } from 'apps/event-service/src/event/schemas/event.schema';
import { Model } from 'mongoose';

@Injectable()
export class EventService {
    constructor(
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
      ) { }

    async getAllEvent() {
        try {
            const events = await this.eventModel.find();
            const eventResponses: EventType[] = events.map(event => this.transformEvent(event));
            return { events: eventResponses };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get all event');
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

    transformEvent(event: EventDocument) {
        const res: EventType = {
            id: event.id,
            name: event.name,
            description: event.description,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            location: event.location,
            speaker: event.speaker,
            guest: event.guest,
            categoryId: event.categoryId,
            isFree: event.isFree,
            price: event.price,
            maxParticipants: event.maxParticipants,
            banner: event.banner,
            videoIntro: event.videoIntro,
            otherDocument: event.otherDocument,
            createdBy: event.createdBy,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
            status: event.status,
        }
        return res;
    }
}
