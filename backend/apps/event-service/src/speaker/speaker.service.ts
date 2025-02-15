import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSpeakerRequest, FindByIdRequest, Speaker as SpeakerType, UpdateSpeakerRequest } from '../../../../libs/common/src/types/event';
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';
import { Speaker, SpeakerDocument } from './schemas/speaker.schema';

@Injectable()
export class SpeakerService {
    constructor(
        @InjectModel(Speaker.name) private speakerModel: Model<SpeakerDocument>
    ) { }

    async getSpeakerById(request: FindByIdRequest) {
        if (!Types.ObjectId.isValid(request.id)) {
            throw new RpcException({
                message: 'Invalid speaker id',
                code: HttpStatus.BAD_REQUEST,
            });
        }
        try {
            const speaker = await this.speakerModel.findById(request.id);
            if (!speaker) {
                throw new RpcException({
                    message: 'Speaker not found',
                    code: HttpStatus.NOT_FOUND,
                });
            }
            return { speaker: this.transformSpeaker(speaker) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get speaker by id');
        }
    }

    async updateSpeaker(request: UpdateSpeakerRequest) {
        try {
            const speaker = await this.speakerModel.findOne({ _id: request.id, createdBy: request.userId });
            if (!speaker) {
                throw new RpcException({
                    message: 'Speaker not found',
                    code: HttpStatus.NOT_FOUND,
                });
            }
            const res = await this.speakerModel.findByIdAndUpdate(request.id, request, { new: true });
            return { speaker: this.transformSpeaker(res) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to update speaker');
        }
    }

    async createSpeaker(request: CreateSpeakerRequest) {
        try {
            const res = await this.speakerModel.create({ ...request, createdBy: request.userId });
            return { speaker: this.transformSpeaker(res) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to create speaker');
        }
    }

    async getAllSpeaker(userId: string) {
        try {
            const speakers = await this.speakerModel.find({ createdBy: userId });
            const speakerResponses: SpeakerType[] = speakers.map((speaker) => this.transformSpeaker(speaker));
            const meta = {
                totalItems: speakers.length,
                count: speakers.length,
            };
            return { speakers: speakerResponses, meta };
        } catch (error) {
            throw handleRpcException(error, 'Failed to get all speaker');
        }
    }

    transformSpeaker(speaker: SpeakerDocument) {
        try {
            const speakerResponse: SpeakerType = {
                id: speaker._id.toString(),
                name: speaker.name,
                bio: speaker.bio,
                avatar: speaker.avatar,
                email: speaker.email,
                linkFb: speaker.linkFb,
                phone: speaker.phone,
                jobTitle: speaker.jobTitle,
                createdAt: speaker.createdAt.toISOString(),
                updatedAt: speaker.updatedAt.toISOString(),
            };
            return speakerResponse;
        } catch (error) {
            throw handleRpcException(error, 'Failed to transform speaker');
        }
    }
}
