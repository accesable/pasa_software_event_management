import { handleRpcException } from '@app/common/filters/handleException';
import { CreateSpeakerRequest } from '@app/common/types/event';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Speaker, SpeakerDocument } from 'apps/event-service/src/speaker/schemas/speaker.schema';
import { Model } from 'mongoose';
import { Speaker as SpeakerType } from '@app/common/types/event';

@Injectable()
export class SpeakerService {
    constructor(
        @InjectModel(Speaker.name) private speakerModel: Model<SpeakerDocument>
    ) {}

    async createSpeaker(request: CreateSpeakerRequest) {
        try {
            const isExist = await this.speakerModel.findOne({ name: request.name });
            if (isExist) {
                throw new RpcException({
                    message: 'Speaker already exist',
                    code: HttpStatus.BAD_REQUEST,
                });
            }
            const res = await this.speakerModel.create(request);
            return { speaker: this.transformSpeaker(res) };
        } catch (error) {
            throw handleRpcException(error, 'Failed to create speaker');
        }
    }

    async getAllSpeaker() {
        try {
            const speakers = await this.speakerModel.find();
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
