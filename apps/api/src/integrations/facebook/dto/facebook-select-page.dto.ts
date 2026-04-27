import { IsString, MinLength } from 'class-validator';

export class FacebookSelectPageDto {
  @IsString()
  @MinLength(1)
  sessionId!: string;

  @IsString()
  @MinLength(1)
  selectedPageId!: string;
}
