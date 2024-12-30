import { handleRpcException } from '@app/common/filters/handleException';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Guest, GuestDocument } from 'apps/event-service/src/guest/schemas/guest.schema';
import { Model } from 'mongoose';
import { CreateGuestRequest, Guest as GuestType } from '@app/common/types/event';

@Injectable()
export class GuestService {
    constructor(
        @InjectModel(Guest.name) private speakerModel: Model<GuestDocument>
    ) {}
    
    async getAllGuest() {
        try {
            const guests = await this.speakerModel.find();
            const guestResponses: GuestType[] = guests.map(guest => this.transformGuest(guest));

            const meta = {
                totalItems: guests.length,
                count: guests.length,
            };

            return {
                guests: guestResponses,
                meta: meta,
            };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get all guest');
        }
    }

    async createGuest(request: CreateGuestRequest){
        try {
            const res = await this.speakerModel.create(request);
            return { guest: this.transformGuest(res) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to create guest');
        }
    }

    transformGuest(guest: GuestDocument) {
        try {
            const guestRespone: GuestType = {
                id: guest._id.toString(),
                name: guest.name,
                jobTitle: guest.jobTitle,
                organization: guest.organization,
                linkSocial: guest.linkSocial,
                avatar: guest.avatar,
                createdAt: guest.createdAt.toISOString(),
                updatedAt: guest.updatedAt.toISOString(),
            };
            return guestRespone;
        } catch (error) {
            throw handleRpcException(error, 'Failed to transform guest');
        }
    }
}
