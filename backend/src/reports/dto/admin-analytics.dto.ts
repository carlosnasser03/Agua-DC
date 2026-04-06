import { IsDateString, IsOptional } from 'class-validator';

export class AdminAnalyticsDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
