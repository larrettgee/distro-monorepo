import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { VerifiedGuard } from '../auth/verified.guard';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import {
  CreateSubmissionsResultDto,
  SubmissionResponseDto,
} from './dto/submission-response.dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('submissions')
@ApiBearerAuth()
@Controller('campaigns/:campaignId/submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @UseGuards(PrivyAuthGuard, RolesGuard, VerifiedGuard)
  @Roles('clipper')
  @ApiOperation({
    summary: 'Submit clip URLs to a campaign',
    description:
      'Clipper-only and World ID–gated. Each URL is validated to belong to the clipper’s connected channel.',
  })
  @ApiOkResponse({ type: CreateSubmissionsResultDto })
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateSubmissionDto,
  ): Promise<CreateSubmissionsResultDto> {
    return this.submissionsService.submit(user, campaignId, dto);
  }

  @Get()
  @UseGuards(PrivyAuthGuard)
  @ApiOperation({
    summary: 'List submissions for a campaign',
    description:
      'Brand owners see all submissions; clippers see only their own.',
  })
  @ApiOkResponse({ type: SubmissionResponseDto, isArray: true })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('campaignId') campaignId: string,
  ): Promise<SubmissionResponseDto[]> {
    return this.submissionsService.listForCampaign(user, campaignId);
  }
}
