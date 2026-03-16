import { IsString, IsOptional, IsEnum, IsUUID, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  fullname?: string;

  @IsUUID('4', { message: 'El roleId debe ser un UUID válido' })
  @IsOptional()
  roleId?: string;

  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED'], {
    message: 'El estado debe ser ACTIVE, INACTIVE o BLOCKED',
  })
  @IsOptional()
  status?: string;
}
