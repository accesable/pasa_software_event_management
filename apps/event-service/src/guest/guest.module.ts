import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Guest, GuestSchema } from './schemas/guest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guest.name, schema: GuestSchema },
    ]),
  ],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule { }
