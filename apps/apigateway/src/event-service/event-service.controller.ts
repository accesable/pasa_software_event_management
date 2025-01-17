import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles, BadRequestException, SetMetadata } from '@nestjs/common';
import { EventServiceService } from './event-service.service';
import { CreateEventDto } from './dto/create-event-service.dto';
import { ResponseMessage, User } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventDto } from './dto/update-event-service.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { FileServiceService } from '../file-service/file-service.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { DecodeAccessResponse } from '../../../../libs/common/src';
import { RpcException } from '@nestjs/microservices';
import { EVENT_PACKAGE_NAME } from '../../../../libs/common/src/types/event';
import { CheckIdExistGuard } from '../guards/check-id-exist.guard';

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
    @Body('users') users: { email: string, id: string }[],
    @User() user: DecodeAccessResponse,
  ) {
    if(!users || users.length === 0) {
      throw new BadRequestException('No users provided');
    }
    
    const event = await this.eventServiceService.getEventById(eventId);
    if (!event) {
      throw new BadRequestException('Event not found');
    }

    if (event.event.createdBy.id !== user.id) {
      throw new BadRequestException(
        'You are not authorized to send invites for this event',
      );
    }

    return this.eventServiceService.sendEventInvites(
      users,
      event
    );
  }

  @Get(':id/participants')
  @ResponseMessage('Get participants success')
  async getParticipantsEvent(@Param('id') eventId: string) {
    return this.eventServiceService.getParticipantsEvent(eventId);
  }

  @Get(':id/accept')
  // add guard check event already Cancelled
  async acceptInvitation(@Param('id') eventId: string, @Query() query: any) {
    return this.eventServiceService.acceptInvitation(eventId, query);
  }

  @Get(':id/decline')
  // add guard check event already Cancelled
  async declineInvitation(@Param('id') eventId: string, @Query() query: any) {
    return this.eventServiceService.declineInvitation(eventId, query);
  }

  @Get('participated-events')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Participated events fetched successfully')
  async getParticipatedEvents(
    @Query('status') status?: string,
    @User() user?: DecodeAccessResponse,
  ) {
    return this.eventServiceService.getParticipatedEvents(user.id, status);
  }

  @Get('organized-events')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Organized events fetched successfully')
  async getOrganizedEvents(
    @Query('status') status?: string,
    @User() user?: DecodeAccessResponse,
  ) {
    return this.eventServiceService.getOrganizedEvents(user.id, status);
  }

  // // QUESTION METHODS
  // @Post(':id/questions')
  // @UseGuards(JwtAuthGuard)
  // @ResponseMessage('Question created successfully')
  // async createQuestion(
  //   @Param('id') id: string,
  //   @Body('question') question: string,
  //   @User() user: DecodeAccessResponse,
  // ) {
  //   const event = await this.eventServiceService.getEventById(id);

  //   if (!event) {
  //     throw new RpcException('Event not found');
  //   }
  //   return this.eventServiceService.createQuestion(id, question, user);
  // }

  // @Get(':id/questions')
  // @ResponseMessage('Questions retrieved successfully')
  // async getEventQuestions(@Param('id') id: string) {
  //   const event = await this.eventServiceService.getEventById(id);

  //   if (!event) {
  //     throw new RpcException('Event not found');
  //   }
  //   return this.eventServiceService.getEventQuestions(id);
  // }

  // @Patch(':id/questions/:questionId')
  // @UseGuards(JwtAuthGuard)
  // @ResponseMessage('Question updated successfully')
  // async updateQuestion(
  //   @Param('id') id: string,
  //   @Param('questionId') questionId: string,
  //   @Body('answered') answered: boolean,
  //   @User() user: DecodeAccessResponse,
  // ) {
  //   const event = await this.eventServiceService.getEventById(id);

  //   if (!event) {
  //     throw new RpcException('Event not found');
  //   }

  //   return this.eventServiceService.updateQuestion(
  //     id,
  //     questionId,
  //     answered,
  //     user,
  //   );
  // }

  // @Post(':id/questions/:questionId/answers')
  // @UseGuards(JwtAuthGuard)
  // @ResponseMessage('Answer created successfully')
  // async answerQuestion(
  //   @Param('id') id: string,
  //   @Param('questionId') questionId: string,
  //   @Body('answer') answer: string,
  //   @User() user: DecodeAccessResponse,
  // ) {
  //   return this.eventServiceService.answerQuestion(
  //     id,
  //     questionId,
  //     answer,
  //     user,
  //   );
  // }

  // @Post(':id/feedbacks')
  // @UseGuards(JwtAuthGuard)
  // @ResponseMessage('Feedback created successfully')
  // async createFeedback(
  //   @Param('id') id: string,
  //   @Body('feedback') feedback: string,
  //   @Body('rating') rating: number,
  //   @User() user: DecodeAccessResponse,
  // ) {
  //   const event = await this.eventServiceService.getEventById(id);

  //   if (!event) {
  //     throw new RpcException('Event not found');
  //   }
  //   return this.eventServiceService.createFeedback(id, feedback, rating, user);
  // }

  // @Get(':id/feedbacks')
  // @ResponseMessage('Feedbacks retrieved successfully')
  // async getEventFeedbacks(@Param('id') id: string) {
  //   const event = await this.eventServiceService.getEventById(id);

  //   if (!event) {
  //     throw new RpcException('Event not found');
  //   }
  //   return this.eventServiceService.getEventFeedbacks(id);
  // }

  @Post(':eventId/files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: (req, file, callback) => {
        const allowedExtensions = {
          banner: ['png', 'jpg', 'jpeg'],
          documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
          videoIntro: ['mp4'],
        };

        const field: string = req.body.field;
        const extension = file.originalname.split('.').pop()?.toLowerCase();

        if (
          !field ||
          !allowedExtensions[field] ||
          !extension ||
          !allowedExtensions[field].includes(extension)
        ) {
          return callback(
            new BadRequestException(
              `File type .${extension} not allowed for ${field}`,
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB mặc định
      },
    }),
  )
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
    const event = await this.eventServiceService.getEventById(eventId);

    if (field === 'banner') {
      if (event.event.banner) {
        this.eventServiceService.deleteFilesUrl([event.event.banner], '');
      }
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
      if (event.event.videoIntro) {
        this.eventServiceService.deleteFilesUrl([], event.event.videoIntro);
      }
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
    if (field.includes('banner')) {
      updateObject.banner = '';
      urls.push(event.event.banner);
    };
    if (field.includes('videoIntro')) {
      updateObject.videoIntro = '';
    };

    if (field.includes('documents')) {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided to delete documents');
      }
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
  @SetMetadata('serviceName', EVENT_PACKAGE_NAME)
  @UseGuards(CheckIdExistGuard)
  @ResponseMessage('Get event by id success')
  async getEventById(@Param('id') id: string) {
    // if (!Types.ObjectId.isValid(id)) {
    //   throw new BadRequestException('Invalid Event ID');
    // }

    // const isExist = await this.eventServiceService.isExistEvent(id);
    // if (!isExist.isExist) {
    //   throw new BadRequestException('Event not found');
    // }
    // return this.eventServiceService.getEventById(id);
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