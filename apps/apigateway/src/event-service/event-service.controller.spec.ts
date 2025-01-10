import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { CategoryServiceController, EventServiceController } from './event-service.controller';
import { EventServiceService } from './event-service.service';
import { DecodeAccessResponse } from '@app/common';
import { CreateEventDto } from './dto/create-event-service.dto';
import { of } from 'rxjs';
import { FileServiceService } from '../file-service/file-service.service';


describe('EventController', () => {
  let controller: EventServiceController;
  let service: EventServiceService;
  let app: INestApplication;
  let fileService: FileServiceService;

  const mockEvent = {
    id: '1',
    name: 'test',
    description: 'test',
    startDate: '2025-05-20T09:00:00Z',
    endDate: '2025-05-25T17:00:00Z',
    location: 'test',
    categoryId: '64c6d61ab9c76a46dd2db424',
    createdBy: {
      id: '64c6cf77b9c76a46dd2db41e',
      email: 'test@gmail.com'
    },
    maxParticipants: 10,
    banner: 'test',
    videoIntro: 'test',
    documents: [
      'test'
    ],
    guestIds: [],
    schedule: [],
    sponsors: [],
    status: 'SCHEDULED',
  };

  const mockCategory = {
    name: 'test',
    description: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventServiceController],
      providers: [
        {
          provide: EventServiceService,
          useValue: {
            getAllEvent: jest.fn().mockResolvedValue([mockEvent]),
            getEventById: jest.fn().mockResolvedValue(mockEvent),
            createEvent: jest.fn().mockResolvedValue(mockEvent),
            updateEvent: jest.fn().mockResolvedValue(mockEvent),
            getAllEventByCategoryName: jest.fn().mockResolvedValue([mockEvent]),
            getCategoryById: jest.fn().mockResolvedValue(mockCategory),
            getAllCategory: jest.fn().mockResolvedValue([mockCategory]),
            createCategory: jest.fn().mockResolvedValue(mockCategory),
            updateCategory: jest.fn().mockResolvedValue(mockCategory),
            checkOwnership: jest.fn().mockResolvedValue({ isOwner: true }),
            cancelEvent: jest.fn().mockResolvedValue({ message: 'Event canceled successfully' }),
            acceptInvitation: jest.fn().mockResolvedValue({ message: 'Invitation accepted successfully' }),
            declineInvitation: jest.fn().mockResolvedValue({ message: 'Invitation declined successfully' }),
            sendEventInvites: jest.fn().mockResolvedValue({ message: 'Invitation sent successfully' }),
            decreaseMaxParticipant: jest.fn().mockResolvedValue({ message: 'Max participant decreased successfully' }),
            isExistEvent: jest.fn().mockResolvedValue({ isExist: true })
          }
        },
        {
          provide: getModelToken(Event.name),
          useValue: {
            find: jest.fn().mockResolvedValue([mockEvent]),
            findById: jest.fn().mockResolvedValue(mockEvent),
            create: jest.fn().mockResolvedValue(mockEvent),
            findByIdAndUpdate: jest.fn().mockResolvedValue(mockEvent),
            findOne: jest.fn().mockResolvedValue(mockEvent),
            findByIdAndDelete: jest.fn().mockResolvedValue(mockEvent)
          },
        },
        {
          provide: getModelToken(CategoryServiceController.name),
          useValue: {
            find: jest.fn().mockResolvedValue([mockCategory]),
            findById: jest.fn().mockResolvedValue(mockCategory),
            create: jest.fn().mockResolvedValue(mockCategory),
            findByIdAndUpdate: jest.fn().mockResolvedValue(mockCategory),
            findOne: jest.fn().mockResolvedValue(mockCategory)
          },
        },
        {
          provide: 'TICKET_SERVICE',
          useValue: {
            emit: jest.fn()
          }
        },
        {
          provide: 'NOTIFICATION_SERVICE',
          useValue: {
            emit: jest.fn()
          }
        },
        {
          provide: FileServiceService,
          useValue: {
            uploadFiles: jest.fn().mockResolvedValue([{ path: 'newAvatarUrl' }]),
          },
        },
      ],
    }).compile();

    controller = module.get<EventServiceController>(EventServiceController);
    service = module.get<EventServiceService>(EventServiceService);

    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllEvent', () => {
    it('should return an array of events', async () => {
      const result = await controller.getAllEvents({ query: {} });
      expect(result).toEqual([mockEvent]);
      expect(service.getAllEvent).toHaveBeenCalledWith({}, undefined, undefined);
    });

    it('should call service with limit and offset', async () => {
      await controller.getAllEvents({ query: { status: 'SCHEDULED' } });
      expect(service.getAllEvent).toHaveBeenCalledWith(
        { status: 'SCHEDULED' },
        undefined,
        undefined
      );
    });
  });

  describe('getEventById', () => {
    it('should return an event by id', async () => {
      const result = await controller.getEventById('64c6d692b9c76a46dd2db428');
      expect(result).toEqual(mockEvent);
      expect(service.getEventById).toHaveBeenCalledWith('64c6d692b9c76a46dd2db428');
    });
  });

  describe('createEvent', () => {
    it('should create an event', async () => {
      const mockEvent: CreateEventDto = {
        name: 'test',
        description: 'test',
        startDate: new Date("2025-05-20T09:00:00Z"),
        endDate: new Date("2025-05-25T17:00:00Z"),
        location: "test",
        categoryId: "676b9128c0ea46752f9a5c89",
        schedule: [
          {
            title: "Bài giảng mở đầu",
            startTime: new Date("2024-03-20T08:30:00.000Z"),
            endTime: new Date("2024-03-20T09:30:00.000Z"),
            description: "Giới thiệu tổng quan",
            speakerIds: [
              "676bd233af6d565ec41efb57",
              "676bd25aaf6d565ec41efb5f"
            ]
          },
          {
            title: "Phần thảo luận",
            startTime: new Date("2024-03-20T10:00:00.000Z"),
            endTime: new Date("2024-03-20T11:00:00.000Z"),
            description: "Hỏi đáp về chủ đề AI",
            speakerIds: [
              "6765624258a5ed4b6cb5fad8"
            ]
          }
        ],
        guestIds: [
          "6765b1ee4abd0a01e2da4736",
          "676bce0daf6d565ec41efb50"
        ]
      };
      const user: DecodeAccessResponse = { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' } as DecodeAccessResponse;
      const expectedResult = {
        event: {
          id: '1',
          ...mockEvent,
          createdBy: {
            id: user.id,
            email: user.email,
          },
        },
      };

      (service.createEvent as jest.Mock).mockReturnValue(of(expectedResult));

      const result = await controller.createEvent(mockEvent, user);
      expect(result).toEqual(expectedResult);
      expect(service.createEvent).toHaveBeenCalledWith(mockEvent, user);
    });
  });

  // describe('updateEvent', () => {
  //   it('should update an event', async () => {
  //     const result = await controller.updateEvent({ id: '64c6d692b9c76a46dd2db428' }, mockEvent);
  //     expect(result).toEqual(mockEvent);
  //     expect(service.updateEvent).toHaveBeenCalledWith('64c6d692b9c76a46dd2db428', mockEvent);
  //   });
  // });
});