import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { EventServiceService } from './event-service.service';
import { CreateEventDto } from './dto/create-event-service.dto';
import { ResponseMessage, StatusEvent, User } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateEventCategoryDto, UpdateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventDto } from './dto/update-event-service.dto';
import { CreateGuestDto, UpdateGuestDto } from './dto/create-guest.dto';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto/create-speaker.dto';
import { FileServiceService } from '../file-service/file-service.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { DecodeAccessResponse } from '../../../../libs/common/src';
import { CheckEventMaxParticipantsGuard } from '../guards/check-event-max-participants.guard';
import { CheckEventStatusGuard } from '../guards/check-event-status.guard';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Controller('events')
export class EventServiceController {
  constructor(
    private readonly eventServiceService: EventServiceService,
    private readonly filesService: FileServiceService,
  ) { }

  @Get(':id/registered-participants') // Endpoint mới
  @UseGuards(JwtAuthGuard) // Optional: Thêm JwtAuthGuard nếu cần bảo vệ endpoint
  @ResponseMessage('Get registered participants success')
  async getRegisteredParticipants(
    @Param('id') eventId: string,
    @User() user: DecodeAccessResponse, // Optional: Thêm User decorator nếu cần quyền admin/organizer
  ) {
    return this.eventServiceService.getRegisteredParticipants(eventId);
  }

  @Get(':id/participants-with-faces')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get participants with faces success')
  async getParticipantsWithFaces(
    @Param('id') eventId: string,
    @User() user: DecodeAccessResponse,
  ) {
    return this.eventServiceService.getParticipantsWithFaces(eventId);
  }

  @Get('/event-comparison') // Endpoint mới
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get event comparison data success')
  async getEventComparisonData() {
    return this.eventServiceService.getEventComparisonData();
  }

  @Get(':id/registrations-over-time')
  @ResponseMessage('Event registrations over time fetched successfully')
  async getRegistrationsOverTime(
    @Param('id') eventId: string,
  ) {
    return this.eventServiceService.getEventRegistrationsOverTime(eventId);
  }

  @Get('total-events-over-time')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Total organized events over time fetched successfully')
  async getTotalEventsOverTime(
    @User() user: DecodeAccessResponse,
  ) {
    return this.eventServiceService.getTotalEventsOverTime(user.id);
  }

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Dashboard statistics fetched successfully')
  async getDashboardStats(
    @User() user: DecodeAccessResponse,
  ): Promise<DashboardStatsDto> {
    return this.eventServiceService.getDashboardStats(user.id);
  }

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard, CheckEventMaxParticipantsGuard, CheckEventStatusGuard)
  @StatusEvent('Scheduled')
  @ResponseMessage('Invitations sent successfully')
  async sendInvites(
    @Param('id') eventId: string,
    @Body('users') users: { email: string, id: string }[],
    @User() user: DecodeAccessResponse,
  ) {
    if (!users || users.length === 0) {
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

  @Get(':eventId/participant')
  @UseGuards(JwtAuthGuard)
  async getParticipantByEventAndUser(
    @Param('eventId') eventId: string,
    @User() user: DecodeAccessResponse,
  ) {
    return this.eventServiceService.getParticipantByEventAndUser(eventId, user.id);
  }

  @Get(':id/accept')
  @UseGuards(CheckEventMaxParticipantsGuard, CheckEventStatusGuard)
  @StatusEvent('Scheduled')
  async acceptInvitation(@Param('id') eventId: string, @Query() query: any) {
    return this.eventServiceService.acceptInvitation(eventId, query);
  }

  @Get(':id/decline')
  @UseGuards(CheckEventStatusGuard)
  @StatusEvent('Scheduled')
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

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Question submitted successfully')
  async createQuestion(
    @Param('id') eventId: string,
    @Body() body: { text: string },
    @User() user: DecodeAccessResponse,
  ) {
    if (!body.text) {
      throw new BadRequestException('Question text is required');
    }
    return this.eventServiceService.createQuestion(eventId, user.id, body.text);
  }

  // Trả lời một câu hỏi
  @Post('questions/:questionId/answers')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Answer submitted successfully')
  async answerQuestion(
    @Param('questionId') questionId: string,
    @Body() body: { text: string },
    @User() user: DecodeAccessResponse,
  ) {
    if (!body.text) {
      throw new BadRequestException('Answer text is required');
    }
    return this.eventServiceService.answerQuestion(questionId, user.id, body.text);
  }

  // Lấy danh sách câu hỏi của một sự kiện
  @Get(':id/questions')
  @ResponseMessage('Questions fetched successfully')
  async getQuestions(@Param('id') eventId: string) {
    return this.eventServiceService.getEventQuestions(eventId);
  }

  @Post(':id/feedback')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Feedback submitted successfully')
  async submitFeedback(
    @Param('id') eventId: string,
    @Body() body: { rating: number; comment: string },
    @User() user: DecodeAccessResponse,
  ) {
    return this.eventServiceService.submitFeedback(eventId, user.id, body.rating, body.comment);
  }

  @Patch(':id/feedback')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Feedback updated successfully')
  async updateFeedback(
    @Param('id') eventId: string,
    @Body() body: { rating: number; comment: string },
    @User() user: DecodeAccessResponse,
  ) {
    return this.eventServiceService.updateFeedback(eventId, user.id, body.rating, body.comment);
  }

  @Get(':id/feedback/user')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Feedback fetched successfully')
  async getFeedbackByUser(@Param('id') eventId: string, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.getFeedbackByUser(eventId, user.id);
  }

  @Get(':id/feedbacks')
  @ResponseMessage('Feedbacks fetched successfully')
  async getFeedbacks(@Param('id') eventId: string) {
    return this.eventServiceService.getEventFeedbacks(eventId);
  }

  @Get(':id/feedback-analysis')
  @ResponseMessage('Feedback analysis fetched successfully')
  async getFeedbackAnalysis(@Param('id') eventId: string) {
    return this.eventServiceService.getFeedbackAnalysis(eventId);
  }

  @Post(':id/files')
  @UseGuards(JwtAuthGuard, CheckEventStatusGuard)
  @StatusEvent('Scheduled')
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
        fileSize: 500 * 1024 * 1024, // 500 MB mặc định
      },
    }),
  )
  @ResponseMessage('Files uploaded successfully')
  async uploadFilesToEvent(
    @Param('id') eventId: string,
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

  @Delete(':id/files')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Files deleted successfully')
  async deleteFilesFromEvent(
    @Param('id') eventId: string,
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
  async updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @User() user: DecodeAccessResponse) {
    const event = await this.eventServiceService.getEventById(id);
    if (!event) {
      throw new BadRequestException('Event not found');
    }

    if (event.event.createdBy.id !== user.id) {
      throw new BadRequestException(
        'You do not have permission to update this event',
      );
    }
    return this.eventServiceService.updateEvent(id, updateEventDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Event created successfully')
  createEvent(@Body() createEventDto: CreateEventDto, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.createEvent(createEventDto, { id: user.id, email: user.email });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CheckEventStatusGuard)
  @StatusEvent('Scheduled')
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
  createCategory(@Body() createEventCategoryDto: CreateEventCategoryDto) {
    return this.eventServiceService.createCategory(createEventCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Update category success')
  updateCategory(@Param('id') id: string, @Body() updateEventCategoryDto: UpdateEventCategoryDto) {
    return this.eventServiceService.updateCategory(id, updateEventCategoryDto);
  }
}

@Controller('speakers')
export class SpeakerServiceController {
  constructor(private readonly eventServiceService: EventServiceService) { }

  @Get(':id')
  @ResponseMessage('Get speaker by id success')
  getSpeakerById(@Param('id') id: string) {
    return this.eventServiceService.getSpeakerById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Update speaker success')
  updateSpeaker(@Param('id') id: string, @Body() updateSpeakerDto: UpdateSpeakerDto, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.updateSpeaker(id, updateSpeakerDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get all speakers success')
  getAllSpeaker(@User() user: DecodeAccessResponse) {
    return this.eventServiceService.getAllSpeaker(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Speaker created successfully')
  createSpeaker(@Body() createSpeakerDto: CreateSpeakerDto, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.createSpeaker(createSpeakerDto, user.id);
  }
}

@Controller('guests')
export class GuestServiceController {
  constructor(private readonly eventServiceService: EventServiceService) { }

  @Get(':id')
  @ResponseMessage('Get guest by id success')
  getGuestById(@Param('id') id: string) {
    return this.eventServiceService.getGuestById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Update guest success')
  updateGuest(@Param('id') id: string, @Body() updateGuestDto: UpdateGuestDto, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.updateGuest(id, updateGuestDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get all guests success')
  getAllGuest(@User() user: DecodeAccessResponse) {
    return this.eventServiceService.getAllGuest(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Guest created successfully')
  createGuest(@Body() createGuestDto: CreateGuestDto, @User() user: DecodeAccessResponse) {
    return this.eventServiceService.createGuest(createGuestDto, user.id);
  }
}