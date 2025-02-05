export interface EventScheduleItem {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    speakerIds: string[];
}