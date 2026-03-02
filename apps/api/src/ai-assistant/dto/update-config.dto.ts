import { IsIn, IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export type ResponseTone = 'professional' | 'friendly' | 'casual' | 'strict';

export const RESPONSE_TONES: ResponseTone[] = ['professional', 'friendly', 'casual', 'strict'];

export class UpdateConfigDto {
  @IsOptional()
  @IsIn(RESPONSE_TONES)
  responseTone?: ResponseTone;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  confidenceThreshold?: number;

  @IsOptional()
  @IsBoolean()
  autoReplyEnabled?: boolean;
}
