import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from '../event/schemas/feedback.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) { }

  async createFeedback(eventId: string, userId: string, rating: number, comment: string) {
    try {
      const isExist = await this.feedbackModel.findOne({ eventId, userId });
      if (isExist) {
        throw new RpcException({ message: 'Feedback already exists', code: HttpStatus.BAD_REQUEST, });
      }
      const feedback = new this.feedbackModel({ eventId, userId, rating, comment });
      await feedback.save();
      return { feedback: this.transformFeedback(feedback) };
    } catch (error) {
      throw new RpcException({ message: error.message, code: 500 });
    }
  }

  async updateFeedback(eventId: string, userId: string, rating: number, comment: string) {
    try {
      const feedback = await this.feedbackModel.findOne({ eventId, userId });
      if (!feedback) {
        throw new RpcException({ message: 'Feedback not found', code: HttpStatus.NOT_FOUND });
      }
      feedback.rating = rating;
      feedback.comment = comment;
      await feedback.save();
      return { feedback: this.transformFeedback(feedback) };
    } catch (error) {
      throw new RpcException({ message: error.message, code: 500 });
    }
  }

  async getFeedbackByUser(eventId: string, userId: string) {
    try {
      const feedback = await this.feedbackModel.findOne({ eventId, userId });
      if (!feedback) {
        throw new RpcException({ message: 'Feedback not found', code: HttpStatus.NOT_FOUND });
      }
      return { feedback: this.transformFeedback(feedback) };
    } catch (error) {
      throw new RpcException({ message: error.message, code: 500 });
    }
  }

  async getFeedbacks(eventId: string) {
    try {
      const feedbacks = await this.feedbackModel.find({ eventId }).exec();
      const transformed = feedbacks.map(fb => this.transformFeedback(fb));
      return { feedbacks: transformed };
    } catch (error) {
      throw new RpcException({ message: error.message, code: 500 });
    }
  }

  transformFeedback(feedback: FeedbackDocument) {
    return {
      id: feedback._id.toString(),
      eventId: feedback.eventId.toString(),
      userId: feedback.userId.toString(),
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt ? feedback.createdAt.toISOString() : '',
      updatedAt: feedback.updatedAt ? feedback.updatedAt.toISOString() : '',
    };
  }
}
