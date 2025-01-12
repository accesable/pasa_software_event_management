export type EventStatus = 'in progress' | 'completed' | 'on hold' | string;
export type EventCategory = 'technology' | 'marketing' | 'finance' | string;
export type EventPriority = 'high' | 'medium' | 'low' | string;
export type EventType =
  | 'software development'
  | 'marketing'
  | 'research'
  | string;

export type Events = {
  event_id: string;
  event_name: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  priority: EventPriority;
  capacity: number;
  event_description: string;
  event_location: string;
  event_type: EventType;
  event_category: EventCategory;
//   event_duration: number;
};
