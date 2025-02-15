// apps/apigateway/src/event-service/event-service.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FileServiceService } from '../file-service/file-service.service';
import { DecodeAccessResponse } from '../../../../libs/common/src';
import { EVENT_SERVICE } from '../constants/service.constant'; // Import EVENT_SERVICE constant
import { Reflector } from '@nestjs/core'; // Import Reflector
import { EventServiceController } from '../event-service/event-service.controller';
import { EventServiceService } from '../event-service/event-service.service';

describe('EventServiceController', () => {
  let controller: EventServiceController;

  // Tạo mock cho EventServiceService với các hàm cần thiết
  const eventServiceServiceMock = {
    getEventById: jest.fn(),
    sendEventInvites: jest.fn(),
    getParticipantsEvent: jest.fn(),
    getParticipantByEventAndUser: jest.fn(),
    getParticipatedEvents: jest.fn(),
    getOrganizedEvents: jest.fn(),
    createQuestion: jest.fn(),
    answerQuestion: jest.fn(),
    getEventQuestions: jest.fn(),
    submitFeedback: jest.fn(),
    getEventFeedbacks: jest.fn(),
    getFeedbackAnalysis: jest.fn(),
  };

  // Mock cho EVENT_SERVICE (ClientGrpc)
  const mockEventServiceClient = {
    getService: jest.fn().mockReturnValue({ // Mock getService to return a mock EventServiceClient
      getEventById: jest.fn(), // Mock getEventById function
    }),
  };

  // Dù controller có dùng file service trong các endpoint upload, ta không cần dùng đến trong các test dưới
  const fileServiceServiceMock = {};
  const mockReflector = {
    get: jest.fn() // Mock Reflector's get method if needed
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventServiceController],
      providers: [
        { provide: EventServiceService, useValue: eventServiceServiceMock },
        { provide: FileServiceService, useValue: fileServiceServiceMock },
        { provide: EVENT_SERVICE, useValue: mockEventServiceClient }, // Provide mock for EVENT_SERVICE
        { provide: Reflector, useValue: mockReflector }, // Provide mock for Reflector
      ],
    }).compile();

    controller = module.get<EventServiceController>(EventServiceController);
    jest.clearAllMocks();
  });

  describe('sendInvites', () => {
    it('should send invites successfully when event exists and user is owner', async () => {
      const eventId = 'event1';
      const users = [{ email: 'invitee@example.com', id: 'user1' }];
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };
      // Giả lập event trả về với createdBy.id trùng với user.id
      const fakeEvent = { event: { createdBy: { id: 'user1' } } };
      (eventServiceServiceMock.getEventById as jest.Mock).mockResolvedValue(fakeEvent);
      (eventServiceServiceMock.sendEventInvites as jest.Mock).mockResolvedValue({
        message: 'Invitations sent successfully',
        success: true,
      });

      const result = await controller.sendInvites(eventId, users, user);
      expect(eventServiceServiceMock.getEventById).toHaveBeenCalledWith(eventId);
      expect(eventServiceServiceMock.sendEventInvites).toHaveBeenCalledWith(users, fakeEvent);
      expect(result).toEqual({
        message: 'Invitations sent successfully',
        success: true,
      });
    });

    it('should throw BadRequestException if no users provided', async () => {
      const eventId = 'event1';
      const users: any[] = [];
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };

      await expect(controller.sendInvites(eventId, users, user))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getParticipantsEvent', () => {
    it('should return participants for an event', async () => {
      const eventId = 'event1';
      const participantsData = { participants: ['participant1', 'participant2'] };
      (eventServiceServiceMock.getParticipantsEvent as jest.Mock).mockResolvedValue(participantsData);

      const result = await controller.getParticipantsEvent(eventId);
      expect(eventServiceServiceMock.getParticipantsEvent).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(participantsData);
    });
  });

  describe('getParticipantByEventAndUser', () => {
    it('should return participant info for given event and user', async () => {
      const eventId = 'event1';
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };
      const participantInfo = { participant: { id: 'p1', info: 'some info' } };
      (eventServiceServiceMock.getParticipantByEventAndUser as jest.Mock).mockResolvedValue(participantInfo);

      const result = await controller.getParticipantByEventAndUser(eventId, user);
      expect(eventServiceServiceMock.getParticipantByEventAndUser).toHaveBeenCalledWith(eventId, user.id);
      expect(result).toEqual(participantInfo);
    });
  });

  describe('getParticipatedEvents', () => {
    it('should return participated events for a user', async () => {
      const status = 'completed';
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };
      const participatedData = { events: ['eventA', 'eventB'] };
      (eventServiceServiceMock.getParticipatedEvents as jest.Mock).mockResolvedValue(participatedData);

      const result = await controller.getParticipatedEvents(status, user);
      expect(eventServiceServiceMock.getParticipatedEvents).toHaveBeenCalledWith(user.id, status);
      expect(result).toEqual(participatedData);
    });
  });

  describe('createQuestion', () => {
    it('should create a question successfully when text is provided', async () => {
      const eventId = 'event1';
      const body = { text: 'What is the agenda for today?' };
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };
      (eventServiceServiceMock.createQuestion as jest.Mock).mockResolvedValue({
        question: { id: 'q1', text: body.text },
      });

      const result = await controller.createQuestion(eventId, body, user);
      expect(eventServiceServiceMock.createQuestion).toHaveBeenCalledWith(eventId, user.id, body.text);
      expect(result).toEqual({ question: { id: 'q1', text: body.text } });
    });

    it('should throw BadRequestException when question text is missing', async () => {
      const eventId = 'event1';
      const body = { text: '' };
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };

      await expect(controller.createQuestion(eventId, body, user))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('answerQuestion', () => {
    it('should answer a question successfully when text is provided', async () => {
      const questionId = 'q1';
      const body = { text: 'The agenda is about project updates.' };
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };
      (eventServiceServiceMock.answerQuestion as jest.Mock).mockResolvedValue({
        question: { id: questionId, text: body.text },
      });

      const result = await controller.answerQuestion(questionId, body, user);
      expect(eventServiceServiceMock.answerQuestion).toHaveBeenCalledWith(questionId, user.id, body.text);
      expect(result).toEqual({ question: { id: questionId, text: body.text } });
    });

    it('should throw BadRequestException when answer text is missing', async () => {
      const questionId = 'q1';
      const body = { text: '' };
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };

      await expect(controller.answerQuestion(questionId, body, user))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getQuestions', () => {
    it('should return questions for the given event', async () => {
      const eventId = 'event1';
      const questionsData = { questions: [{ id: 'q1', text: 'Sample question?' }] };
      (eventServiceServiceMock.getEventQuestions as jest.Mock).mockResolvedValue(questionsData);

      const result = await controller.getQuestions(eventId);
      expect(eventServiceServiceMock.getEventQuestions).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(questionsData);
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const eventId = 'event1';
      const body = { rating: 5, comment: 'Great event!' };
      // Mock DecodeAccessResponse user
      const user: DecodeAccessResponse = { id: 'user1', email: 'test@example.com', name: 'Test User', avatar: '', oldAvatarId: '', phoneNumber: '', isActive: true, role: '', lastLoginAt: '', createdAt: '', updatedAt: '' };
      (eventServiceServiceMock.submitFeedback as jest.Mock).mockResolvedValue({
        message: 'Feedback submitted successfully',
      });

      const result = await controller.submitFeedback(eventId, body, user);
      expect(eventServiceServiceMock.submitFeedback).toHaveBeenCalledWith(eventId, user.id, body.rating, body.comment);
      expect(result).toEqual({ message: 'Feedback submitted successfully' });
    });
  });
});