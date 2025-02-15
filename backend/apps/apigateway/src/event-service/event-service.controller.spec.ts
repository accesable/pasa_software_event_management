// apps/apigateway/src/event-service/event-service.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventServiceController } from './event-service.controller';
import { EventServiceService } from './event-service.service';
import { FileServiceService } from '../file-service/file-service.service';
import { CheckEventMaxParticipantsGuard } from '../guards/check-event-max-participants.guard';
import { CheckEventStatusGuard } from '../guards/check-event-status.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { BadRequestException } from '@nestjs/common';
import { EVENT_SERVICE } from '../constants/service.constant';

// ----- Dummy mocks cho các dependency -----
const eventServiceServiceMock = {
  getEventById: jest.fn(),
  sendEventInvites: jest.fn(),
  getParticipantsEvent: jest.fn(),
  getParticipantByEventAndUser: jest.fn(),
  acceptInvitation: jest.fn(),
  declineInvitation: jest.fn(),
  getParticipatedEvents: jest.fn(),
  createQuestion: jest.fn(),
  answerQuestion: jest.fn(),
  getEventQuestions: jest.fn(),
  submitFeedback: jest.fn(),
};

const fileServiceServiceMock = {
  // Các hàm giả nếu cần dùng trong controller
};

const dummyEventClient = {
  getService: jest.fn().mockReturnValue({}),
};
// ----- End dummy mocks -----

describe('EventServiceController', () => {
  let controller: EventServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventServiceController],
      providers: [
        { provide: EventServiceService, useValue: eventServiceServiceMock },
        { provide: FileServiceService, useValue: fileServiceServiceMock },
        // Cung cấp provider cho token EVENT_SERVICE (dùng cho các guard)
        { provide: EVENT_SERVICE, useValue: dummyEventClient },
        // Cung cấp Reflector (NestJS thường tự cung cấp, nhưng ta thêm vào để đảm bảo)
        Reflector,
        CheckEventMaxParticipantsGuard,
        CheckEventStatusGuard,
        JwtAuthGuard,
      ],
    }).compile();

    controller = module.get<EventServiceController>(EventServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendInvites', () => {
    it('should send invites successfully when event exists and user is owner', async () => {
      // Arrange
      const eventId = 'event123';
      // Giả lập một event mà createdBy.id là 'user1'
      const fakeEvent = { event: { id: eventId, createdBy: { id: 'user1' } } };
      const users = [{ email: 'invitee@example.com', id: 'user2' }];

      // Setup mock cho service
      eventServiceServiceMock.getEventById.mockResolvedValue(fakeEvent);
      eventServiceServiceMock.sendEventInvites.mockResolvedValue({
        message: 'Invitations sent successfully',
        success: true,
      });

      // Act
      const result = await controller.sendInvites(eventId, users, { id: 'user1' } as any);

      // Assert
      expect(eventServiceServiceMock.getEventById).toHaveBeenCalledWith(eventId);
      expect(eventServiceServiceMock.sendEventInvites).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Invitations sent successfully', success: true });
    });

    it('should throw BadRequestException if no users provided', async () => {
      // Arrange
      const eventId = 'event123';
      // Act & Assert
      await expect(
        controller.sendInvites(eventId, [], { id: 'user1' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getParticipantsEvent', () => {
    it('should return participants for an event', async () => {
      // Arrange
      const eventId = 'event123';
      const fakeParticipants = { participants: [{ email: 'a@example.com' }, { email: 'b@example.com' }] };
      eventServiceServiceMock.getParticipantsEvent.mockResolvedValue(fakeParticipants);

      // Act
      const result = await controller.getParticipantsEvent(eventId);

      // Assert
      expect(eventServiceServiceMock.getParticipantsEvent).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(fakeParticipants);
    });
  });

  describe('getParticipantByEventAndUser', () => {
    it('should return participant info for given event and user', async () => {
      // Arrange
      const eventId = 'event123';
      const userId = 'user2';
      const fakeParticipant = { participation: { id: 'p1' } };
      eventServiceServiceMock.getParticipantByEventAndUser.mockResolvedValue(fakeParticipant);

      // Act
      const result = await controller.getParticipantByEventAndUser(eventId, { id: userId } as any);

      // Assert
      expect(eventServiceServiceMock.getParticipantByEventAndUser).toHaveBeenCalledWith(eventId, userId);
      expect(result).toEqual(fakeParticipant);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation successfully', async () => {
      // Arrange
      const eventId = 'event123';
      const token = 'validToken';
      const fakeResponse = { message: 'Invitation accepted successfully' };
      // Khi gọi, controller sẽ truyền query object: { token: 'validToken' }
      eventServiceServiceMock.acceptInvitation.mockResolvedValue(fakeResponse);

      // Act
      const result = await controller.acceptInvitation(eventId, { token });

      // Assert
      expect(eventServiceServiceMock.acceptInvitation).toHaveBeenCalledWith(eventId, { token });
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('declineInvitation', () => {
    it('should decline invitation successfully', async () => {
      // Arrange
      const eventId = 'event123';
      const token = 'validToken';
      const fakeResponse = { message: 'Invitation declined successfully' };
      // Khi gọi, controller sẽ truyền query object: { token: 'validToken' }
      eventServiceServiceMock.declineInvitation.mockResolvedValue(fakeResponse);

      // Act
      const result = await controller.declineInvitation(eventId, { token });

      // Assert
      expect(eventServiceServiceMock.declineInvitation).toHaveBeenCalledWith(eventId, { token });
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('getParticipatedEvents', () => {
    it('should return participated events for a user', async () => {
      // Arrange
      const status = 'FINISHED';
      const fakeResponse = { events: [{ id: 'event1' }, { id: 'event2' }] };
      eventServiceServiceMock.getParticipatedEvents.mockResolvedValue(fakeResponse);

      // Act
      const result = await controller.getParticipatedEvents(status, { id: 'user2' } as any);

      // Assert
      expect(eventServiceServiceMock.getParticipatedEvents).toHaveBeenCalledWith('user2', status);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('createQuestion', () => {
    it('should create a question successfully when text is provided', async () => {
      // Arrange
      const eventId = 'event123';
      const questionBody = { text: 'What is the agenda?' };
      const fakeResponse = { question: { id: 'q1', text: questionBody.text } };
      eventServiceServiceMock.createQuestion.mockResolvedValue(fakeResponse);

      // Act
      const result = await controller.createQuestion(eventId, questionBody, { id: 'user2' } as any);

      // Assert
      expect(eventServiceServiceMock.createQuestion).toHaveBeenCalledWith(eventId, 'user2', questionBody.text);
      expect(result).toEqual(fakeResponse);
    });

    it('should throw BadRequestException when question text is missing', async () => {
      // Arrange
      const eventId = 'event123';
      const questionBody = { text: '' };
      // Act & Assert
      await expect(
        controller.createQuestion(eventId, questionBody, { id: 'user2' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('answerQuestion', () => {
    it('should answer a question successfully when text is provided', async () => {
      // Arrange
      const questionId = 'q1';
      const answerBody = { text: 'The agenda is…' };
      const fakeResponse = { question: { id: questionId, text: answerBody.text } };
      eventServiceServiceMock.answerQuestion.mockResolvedValue(fakeResponse);

      // Act
      const result = await controller.answerQuestion(questionId, answerBody, { id: 'user2' } as any);

      // Assert
      expect(eventServiceServiceMock.answerQuestion).toHaveBeenCalledWith(questionId, 'user2', answerBody.text);
      expect(result).toEqual(fakeResponse);
    });

    it('should throw BadRequestException when answer text is missing', async () => {
      // Arrange
      const questionId = 'q1';
      const answerBody = { text: '' };
      // Act & Assert
      await expect(
        controller.answerQuestion(questionId, answerBody, { id: 'user2' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getQuestions', () => {
    it('should return questions for the given event', async () => {
      // Arrange
      const eventId = 'event123';
      const fakeResponse = { questions: [{ id: 'q1', text: 'Question 1' }] };
      eventServiceServiceMock.getEventQuestions.mockResolvedValue(fakeResponse);

      // Act
      const result = await controller.getQuestions(eventId);

      // Assert
      expect(eventServiceServiceMock.getEventQuestions).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      // Arrange
      const eventId = 'event123';
      const feedbackBody = { rating: 5, comment: 'Great event!' };
      const fakeResponse = { message: 'Feedback submitted successfully' };
      eventServiceServiceMock.submitFeedback.mockResolvedValue(fakeResponse);

      // Act
      const result = await controller.submitFeedback(eventId, feedbackBody, { id: 'user2' } as any);

      // Assert
      expect(eventServiceServiceMock.submitFeedback).toHaveBeenCalledWith(eventId, 'user2', feedbackBody.rating, feedbackBody.comment);
      expect(result).toEqual(fakeResponse);
    });
  });
});
