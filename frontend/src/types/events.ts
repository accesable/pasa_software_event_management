import { EventScheduleItem } from "./schedule";

export interface Events {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  schedule: EventScheduleItem[]; // Đã thêm type cho schedule
  guestIds: string[];
  categoryId: string;
  maxParticipants?: number;
  banner?: string;
  videoIntro?: string;
  documents?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
      id: string;
      email: string;
  };
}