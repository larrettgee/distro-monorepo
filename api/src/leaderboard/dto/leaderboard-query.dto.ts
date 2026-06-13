import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  DEFAULT_LEADERBOARD_LIMIT,
  MAX_LEADERBOARD_LIMIT,
} from '../leaderboard.constants';

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    description: 'Max number of clippers to return.',
    default: DEFAULT_LEADERBOARD_LIMIT,
    minimum: 1,
    maximum: MAX_LEADERBOARD_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LEADERBOARD_LIMIT)
  limit: number = DEFAULT_LEADERBOARD_LIMIT;
}
