import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Guest, GuestDocument } from 'apps/event-service/src/guest/schemas/guest.schema';
import { Model } from 'mongoose';

@Injectable()
export class GuestService {
    @InjectModel(Guest.name) private speakerModel: Model<GuestDocument>
}
