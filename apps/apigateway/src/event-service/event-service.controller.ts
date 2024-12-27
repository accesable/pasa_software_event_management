import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EventServiceService } from './event-service.service';
import { CreateEventDto } from 'apps/apigateway/src/event-service/dto/create-event-service.dto';
import { ResponseMessage, Roles, User } from 'apps/apigateway/src/decorators/public.decorator';
import { JwtAuthGuard } from 'apps/apigateway/src/guards/jwt-auth.guard';
import { RolesGuard } from 'apps/apigateway/src/guards/roles.guard';
import { DecodeAccessResponse } from '@app/common';
import { CreateEventCategoryDto } from 'apps/apigateway/src/event-service/dto/create-event-category.dtc';
import { UpdateEventDto } from 'apps/apigateway/src/event-service/dto/update-event-service.dto';
import { CreateGuestDto } from 'apps/apigateway/src/event-service/dto/create-guest.dto';
import { CreateSpeakerDto } from 'apps/apigateway/src/event-service/dto/create-speaker.dto';

@Controller('events')
export class EventServiceController {
  constructor(private readonly eventServiceService: EventServiceService) { }

  // @Get()
  // @ResponseMessage('Get all event success')
  // getAllEvent(){
  //   return this.eventServiceService.getAllEvent();
  // } 

  @Get()
  @ResponseMessage('Get events with filter (including category) success')
  getAllEvents(@Query() query: any) {
    return this.eventServiceService.getAllEvent(query);
  }

  @Get(':id')
  @ResponseMessage('Get event by id success')
  getEventById(@Param('id') id: string) {
    return this.eventServiceService.getEventById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  // @Roles('organizer', 'admin')
  @ResponseMessage('Update event success')
  updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventServiceService.updateEvent(id, updateEventDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  // @Roles('organizer', 'admin')
  @ResponseMessage('Event created successfully')
  createEvent(@Body() createEventDto: CreateEventDto, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.createEvent(createEventDto, {id: user.id, email: user.email, name: user.name});
  }

  // @Get()
  // findAll() {
  //   return this.eventServiceService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.eventServiceService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventServiceDto: UpdateEventServiceDto) {
  //   return this.eventServiceService.update(+id, updateEventServiceDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.eventServiceService.remove(+id);
  // }
}

@Controller('categories')
export class CategoryServiceController {
  constructor(private readonly eventServiceService: EventServiceService) { }

  @Get()
  @ResponseMessage('Get all category success')
  getAllCategory() {
    return this.eventServiceService.getAllCategory();
  }

  @Get(':id')
  @ResponseMessage('Get category by id success')
  getCategoryById(@Param('id') id: string) {
    return this.eventServiceService.getCategoryById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  // @Roles('organizer', 'admin')
  @ResponseMessage('Category created successfully')
  createCategory(@Body() createEventCategoryDto: CreateEventCategoryDto, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.createCategory(createEventCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizer', 'admin')
  @ResponseMessage('Update category success')
  updateCategory(@Param('id') id: string, @Body() updateEventCategoryDto: CreateEventCategoryDto) {
    return this.eventServiceService.updateCategory(id, updateEventCategoryDto);
  }
}

@Controller('speakers')
export class SpeakerServiceController {
  constructor(private readonly eventServiceService: EventServiceService) { }

  @Get()
  @ResponseMessage('Get all speakers success')
  getAllSpeaker() {
    return this.eventServiceService.getAllSpeaker();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  // @Roles('organizer', 'admin')
  @ResponseMessage('Speaker created successfully')
  createSpeaker(@Body() createSpeakerDto: CreateSpeakerDto) {
    return this.eventServiceService.createSpeaker(createSpeakerDto);
  }
}

@Controller('guests')
export class GuestServiceController {
  constructor(private readonly eventServiceService: EventServiceService) { }

  @Get()
  @ResponseMessage('Get all guests success')
  getAllGuest() {
    return this.eventServiceService.getAllGuest();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  // @Roles('organizer', 'admin')
  @ResponseMessage('Guest created successfully')
  createGuest(@Body() createGuestDto: CreateGuestDto) {
    return this.eventServiceService.createGuest(createGuestDto);
  }
}