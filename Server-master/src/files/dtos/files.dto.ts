import { IsOptional, IsString } from 'class-validator';

export class WipeDTO {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  key: string;
}
