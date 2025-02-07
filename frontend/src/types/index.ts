import type {
  Projects,
  ProjectCategory,
  ProjectStatus,
  ProjectPriority,
} from './projects';
import type { Clients } from './clients';
import type { CampaignAds } from './campaigns';
import type { PostPlatform, Posts, PostCategory } from './posts';
import type {
  CommentsType,
  CommentGender,
  CommentsPlatform,
  Comments,
} from './comments';
import type {
  Bidding,
  AuctionCreator,
  AuctionSales,
  AuctionTransactions,
} from './bidding';
import type {
  LearningCourses,
  RecommendedCourses,
  Exam,
  CommunityGroup,
} from './learnings.ts';
import type {
  TruckDelivery,
  DeliveryAnalytics,
  Truck,
  DeliveryRequest,
} from './logistics.ts';
import type { Tasks } from './dashboard';
import type { Notifications } from './notifications';
import type { Employee } from './employee';
import type { Faq } from './faq';
import type { Pricing } from './pricing';
import type { Session } from './session';
import type { ActivityTimeline } from './timeline';
import type { Events } from './events.ts';
export type {
  Projects,
  ProjectStatus,
  ProjectCategory,
  ProjectPriority,
  Clients,
  CampaignAds,
  PostCategory,
  PostPlatform,
  Posts,
  Comments,
  CommentGender,
  CommentsType,
  CommentsPlatform,
  Bidding,
  AuctionCreator,
  AuctionSales,
  AuctionTransactions,
  LearningCourses,
  RecommendedCourses,
  Exam,
  CommunityGroup,
  TruckDelivery,
  DeliveryAnalytics,
  Truck,
  DeliveryRequest,
  Tasks,
  Notifications,
  Employee,
  Faq,
  Pricing,
  Session,
  ActivityTimeline,
  Events,
};

export interface Participants {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  checkInAt: string | null; // Có thể null nếu chưa check-in
  eventId: string;
  checkOutAt: string | null; // Có thể null nếu chưa check-out
}

export interface Speaker {
  id?: string;
  name: string;
  bio?: string;
  linkFb?: string; // Nếu có
  avatar?: string; // Nếu có
  email: string;
  jobTitle?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Guest { // Add Guest interface
  id?: string;
  name: string;
  jobTitle?: string;
  organization?: string;
  linkSocial?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  email: string;
}

export interface SpeakerGuestData {
  entityType: string;
  id?: string;
  name: string;
  bio?: string;
  linkFb?: string;
  avatar?: string;
  email: string;
  jobTitle?: string;
  createdAt?: string;
  updatedAt?: string;
  organization?: string;
  linkSocial?: string;
}

// src\types\index.ts

export interface TicketType { // Example TicketType interface - adjust based on your actual backend DTO
  id: string;
  participantId: string;
  qrCodeUrl: string;
  status: string;
  usedAt?: string | null;
  // ... other ticket properties ...
}

export interface Participation { // Example Participation interface - adjust based on your actual backend DTO
  id: string;
  eventId: string;
  userId: string;
  sessionIds: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  // ... other participation properties ...
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  phoneNumber?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // ... các trường khác nếu có ...
}