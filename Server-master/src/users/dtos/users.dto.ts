import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDTO {
  @IsInt()
  amount: number;

  @IsString()
  @IsOptional()
  invitedBy: string;
}

export class DeleteDTO {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  key: string;

  @IsString()
  @IsOptional()
  invite: string;
}
