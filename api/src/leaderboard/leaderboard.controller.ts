import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrivyAuthGuard } from '../auth/privy-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ClipperStatsDto } from './dto/clipper-stats.dto';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Top clippers by total views',
    description:
      'Public ranking of clippers by lifetime views, with estimated gross earnings. No auth required.',
  })
  @ApiOkResponse({ type: LeaderboardEntryDto, isArray: true })
  getLeaderboard(
    @Query() query: LeaderboardQueryDto,
  ): Promise<LeaderboardEntryDto[]> {
    return this.leaderboardService.getLeaderboard(query.limit);
  }

  @Get('me')
  @UseGuards(PrivyAuthGuard, RolesGuard)
  @Roles('clipper')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Current clipper’s stats and rank',
    description:
      'Aggregated views, clip count, estimated earnings and leaderboard position for the authenticated clipper.',
  })
  @ApiOkResponse({ type: ClipperStatsDto })
  getMyStats(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ClipperStatsDto> {
    return this.leaderboardService.getStatsForClipper(user.privyId);
  }
}
