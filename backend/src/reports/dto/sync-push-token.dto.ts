import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SyncPushTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  pushToken: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  appVersion?: string;
}
