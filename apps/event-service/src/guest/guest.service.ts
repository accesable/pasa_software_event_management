import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGuestRequest, Guest as GuestType, UpdateGuestRequest} from '../../../../libs/common/src/types/event';
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';
import { Guest, GuestDocument } from './schemas/guest.schema';
import { RpcException } from '@nestjs/microservices';
import { FindByIdRequest } from '../../../../libs/common/src';

@Injectable()
export class GuestService {
    constructor(
        @InjectModel(Guest.name) private speakerModel: Model<GuestDocument>
    ) {}

    async getGuestById(request: FindByIdRequest) {
        try {
            const guest = await this.speakerModel.findById(request.id);
            if (!guest) {
                throw new RpcException({
                    message: 'Guest not found',
                    code: HttpStatus.NOT_FOUND,
                });
            }
            return { guest: this.transformGuest(guest) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get guest by id');
        }
    }

    async updateGuest(request: UpdateGuestRequest){
        try {
            const guest = await this.speakerModel.findOne({ _id: request.id, createdBy: request.userId });
            if (!guest) {
                throw new RpcException({
                    message: 'Guest not found',
                    code: HttpStatus.NOT_FOUND,
                });
            }
            const res = await this.speakerModel.findByIdAndUpdate(request.id, request, { new: true });
            return { guest: this.transformGuest(res) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to update guest');
        }
    }
    
    async getAllGuest(userId: string) {
        try {
            const guests = await this.speakerModel.find({ createdBy: userId });
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
            const res = await this.speakerModel.create({ ...request, createdBy: request.userId });
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
