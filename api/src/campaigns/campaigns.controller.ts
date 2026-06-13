import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { CampaignsService } from './campaigns.service';
import { CampaignQueryDto } from './dto/campaign-query.dto';
import {
  CampaignPerformanceDto,
  CampaignResponseDto,
  CreateCampaignResponseDto,
} from './dto/campaign-response.dto';
import { ConfirmCampaignDto } from './dto/confirm-campaign.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(PrivyAuthGuard, RolesGuard)
  @Roles('brand')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a campaign (draft)',
    description:
      'Creates the off-chain campaign and returns the on-chain params the brand wallet must use to fund it (approve + createJob), followed by POST /campaigns/:id/confirm.',
  })
  @ApiOkResponse({ type: CreateCampaignResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCampaignDto,
  ): Promise<CreateCampaignResponseDto> {
    return this.campaignsService.create(user, dto);
  }

  @Post(':id/confirm')
  @UseGuards(PrivyAuthGuard, RolesGuard)
  @Roles('brand')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirm a campaign on-chain',
    description:
      'Verifies the createJob transaction, captures the escrow job id, and activates the campaign.',
  })
  @ApiOkResponse({ type: CampaignResponseDto })
  confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ConfirmCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.confirm(user, id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Browse campaigns / bounties',
    description: 'Public listing. Defaults to active campaigns.',
  })
  @ApiOkResponse({ type: CampaignResponseDto, isArray: true })
  findAll(
    @Query() query: CampaignQueryDto,
  ): Promise<CampaignResponseDto[]> {
    return this.campaignsService.findAll(query.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by id' })
  @ApiOkResponse({ type: CampaignResponseDto })
  findOne(@Param('id') id: string): Promise<CampaignResponseDto> {
    return this.campaignsService.findOne(id);
  }

  @Get(':id/performance')
  @UseGuards(PrivyAuthGuard, RolesGuard)
  @Roles('brand')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check campaign performance',
    description: 'On-chain budget / allocated / remaining for the brand’s campaign.',
  })
  @ApiOkResponse({ type: CampaignPerformanceDto })
  getPerformance(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<CampaignPerformanceDto> {
    return this.campaignsService.getPerformance(user, id);
  }
}
