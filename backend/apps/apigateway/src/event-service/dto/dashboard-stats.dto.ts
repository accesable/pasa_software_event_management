import { IsNumber } from 'class-validator';

export class DashboardStatsDto {
  @IsNumber()
  organizedEventsCount: number;

  @IsNumber()
  participatedEventsCount: number;

  @IsNumber()
  receivedFeedbacksCount: number;

  @IsNumber()
  createdGuestsCount: number;

  @IsNumber()
  createdSpeakersCount: number;

  @IsNumber()
  totalUsersCount: number;

  @IsNumber()
  totalEventCategoriesCount: number;

  @IsNumber()
  totalEventsCount: number;
}