import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreApiKeyGuard } from './cre-api-key.guard';
import { CRE_API_KEY_HEADER } from './cre.constants';
import { CreService } from './cre.service';
import {
  CreBatchResponseDto,
  RefreshResultDto,
} from './dto/cre-batch-response.dto';

@ApiTags('cre')
@ApiSecurity(CRE_API_KEY_HEADER)
@UseGuards(CreApiKeyGuard)
@Controller('cre')
export class CreController {
  constructor(private readonly creService: CreService) {}

  @Get('batch')
  @ApiOperation({
    summary: 'Current on-chain payout batch',
    description:
      'Per-job aggregated cumulative views for the Chainlink CRE workflow to ' +
      `record on-chain. Authenticated via the \`${CRE_API_KEY_HEADER}\` header. ` +
      'Pure function of stored DB state — always current, and byte-identical ' +
      'across concurrent DON-node calls within a determinism bucket.',
  })
  @ApiOkResponse({ type: CreBatchResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRE API key.' })
  getBatch(): Promise<CreBatchResponseDto> {
    return this.creService.getBatch();
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh stored view counts from YouTube',
    description:
      'Updates `lastViewCount` for active campaigns’ payable submissions. Kept ' +
      'separate from the batch so the batch stays deterministic; call before ' +
      'settlement (ops or a scheduler) to make counts current.',
  })
  @ApiOkResponse({ type: RefreshResultDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRE API key.' })
  refresh(): Promise<RefreshResultDto> {
    return this.creService.refreshViews();
  }
}
