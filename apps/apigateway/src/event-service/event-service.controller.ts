import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
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
import { FileServiceService } from 'apps/apigateway/src/file-service/file-service.service';
import {  FilesInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';

@Controller('events')
export class EventServiceController {
  constructor(
    private readonly eventServiceService: EventServiceService,
    private readonly filesService: FileServiceService,
  ) { }

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Invitations sent successfully')
  async sendInvites(
    @Param('id') eventId: string,
    @Body('emails') emails: string[],
    @User() user: DecodeAccessResponse,
  ) {
    return this.eventServiceService.sendEventInvites(eventId, emails, user);
  }

  // @Get(':id/accept')
  // async acceptInvitation(@Param('id') eventId: string, @Query() query: any) {
  //   return this.eventServiceService.acceptInvitation(eventId, query);
  // }

  // @Get(':id/decline')
  // async declineInvitation(@Param('id') eventId: string, @Query() query: any) {
  //   return this.eventServiceService.declineInvitation(eventId, query);
  // }

  // // QUESTION METHODS
  // @Post(':eventId/questions')
  // @UseGuards(JwtAuthGuard)
  // @ResponseMessage('Question created successfully')
  // async createQuestion(
  //   @Param('eventId') eventId: string,
  //   @Body('question') question: string,
  //   @User() user: DecodeAccessResponse,
  // ) {
  //   return this.eventServiceService.createQuestion(
  //     eventId,
  //     question,
  //     user,
  //   );
  // }

  // @Get(':eventId/questions')
  // @ResponseMessage('Questions retrieved successfully')
  // async getEventQuestions(@Param('eventId') eventId: string) {
  //   return this.eventServiceService.getEventQuestions(eventId);
  // }

  // @Patch(':eventId/questions/:questionId')
  // @UseGuards(JwtAuthGuard)
  // @ResponseMessage('Question updated successfully')
  // async updateQuestion(
  //   @Param('eventId') eventId: string,
  //   @Param('questionId') questionId: string,
  //   @Body('answered') answered: boolean,
  //   @User() user: DecodeAccessResponse,
  // ) {
  //   return this.eventServiceService.updateQuestion(
  //     eventId,
  //     questionId,
  //     answered,
  //     user,
  //   );
  // }

  // @Post(':eventId/questions/:questionId/answers')
  // @UseGuards(JwtAuthGuard)
  // @ResponseMessage('Answer created successfully')
  // async answerQuestion(
  //   @Param('eventId') eventId: string,
  //   @Param('questionId') questionId: string,
  //   @Body('answer') answer: string,
  //   @User() user: DecodeAccessResponse,
  // ) {
  //   return this.eventServiceService.answerQuestion(
  //     eventId,
  //     questionId,
  //     answer,
  //     user,
  //   );
  // }

  @Post(':eventId/files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, {
    fileFilter: (req, file, callback) => {
      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'mp4'];
      const extension = file.originalname.split('.').pop()?.toLowerCase();

      if (!extension || !allowedExtensions.includes(extension)) {
        return callback(
          new BadRequestException(`File type .${extension} not allowed`),
          false
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: 100 * 1024 * 1024,  // 100 MB
    },
  }))
  @ResponseMessage('Files uploaded successfully')
  async uploadFilesToEvent(
    @Param('eventId') eventId: string,
    @Body() body: {
      field: 'banner' | 'documents' | 'videoIntro';
      videoUrl?: string;
    },
    @User() user: DecodeAccessResponse,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const isOwner = await this.eventServiceService.checkOwnership(eventId, user.id);
    if (!isOwner.isOwner) {
      throw new BadRequestException('You are not authorized to upload files for this event');
    }

    const { field, videoUrl } = body;

    if (field === 'videoIntro' && videoUrl) {
      return this.eventServiceService.updateEvent(eventId, {
        videoIntro: videoUrl,
      });
    }

    if ((!files || files.length === 0) && field !== 'videoIntro') {
      throw new BadRequestException('No files provided');
    }

    const uploadedFilesInfo = await this.filesService.uploadFiles(files, {
      entityId: eventId,
      entityType: 'event',
      type: field === 'videoIntro' ? 'video'
        : field === 'documents' ? 'document'
          : 'image',
      field
    });

    const urlList = uploadedFilesInfo.map((f) => f.path);

    if (field === 'banner') {
      return this.eventServiceService.updateEvent(eventId, {
        banner: urlList[0],
      });
    }
    else if (field === 'documents') {
      const found = await this.eventServiceService.getEventById(eventId);
      const oldDocuments = found.event.documents || [];
      const newDocuments = [
        ...oldDocuments,
        ...urlList,
      ];
      return this.eventServiceService.updateEvent(eventId, {
        documents: newDocuments,
      });
    }
    else if (field === 'videoIntro') {
      return this.eventServiceService.updateEvent(eventId, {
        videoIntro: urlList[0],
      });
    }

    return { message: 'No changes made' };
  }

  @Delete(':eventId/files')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Files deleted successfully')
  async deleteFilesFromEvent(
    @Param('eventId') eventId: string,
    @Body() body: {
      field: Array<'banner' | 'documents' | 'videoIntro'>;
      files?: string[];
    },
    @User() user: DecodeAccessResponse,
  ) {
    const isOwner = await this.eventServiceService.checkOwnership(eventId, user.id);
    if (!isOwner.isOwner) {
      throw new BadRequestException('You are not authorized to delete files of this event');
    }
    const event = await this.eventServiceService.getEventById(eventId);

    const { field, files } = body;
    const updateObject: { banner?: string; videoIntro?: string; documents?: string[] } = {};
    const urls = [];
    if (field.includes('banner')){
      updateObject.banner = '';
      urls.push(event.event.banner);
    };
    if (field.includes('videoIntro')){
      updateObject.videoIntro = '';
    };

    if (field.includes('documents') && files?.length) {
      urls.push(...files);
      const oldDocuments = event.event.documents || [];
  
      const documentsToDelete = files.filter((file) => oldDocuments.includes(file));
  
      if (documentsToDelete.length > 0) {
        updateObject.documents = oldDocuments.filter((doc) => !documentsToDelete.includes(doc));
      }
    }
    this.eventServiceService.deleteFilesUrl(urls, event.event.videoIntro);
    return this.eventServiceService.updateEvent(eventId, updateObject);
  }

  @Get()
  @ResponseMessage('Get events with filter (including category) success')
  getAllEvents(@Query() query: any) {
    return this.eventServiceService.getAllEvent(query);
  }

  @Get(':id')
  @ResponseMessage('Get event by id success')
  async getEventById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Event ID');
    }
  
    const isExist = await this.eventServiceService.isExistEvent(id);
    if (!isExist.isExist) {
      throw new BadRequestException('Event not found');
    }
    return this.eventServiceService.getEventById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Update event success')
  updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventServiceService.updateEvent(id, updateEventDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Event created successfully')
  createEvent(@Body() createEventDto: CreateEventDto, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.createEvent(createEventDto, { id: user.id, email: user.email });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Cancel event success')
  async cancelEvent(@Param('id') id: string, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.cancelEvent(id, user.id);
  }
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
  @ResponseMessage('Guest created successfully')
  createGuest(@Body() createGuestDto: CreateGuestDto) {
    return this.eventServiceService.createGuest(createGuestDto);
  }
}