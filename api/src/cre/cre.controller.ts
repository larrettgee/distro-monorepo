import { Controller, Get, UseGuards } from '@nestjs/common';
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
import { CreBatchResponseDto } from './dto/cre-batch-response.dto';

@ApiTags('cre')
@ApiSecurity(CRE_API_KEY_HEADER)
@Controller('cre')
export class CreController {
  constructor(private readonly creService: CreService) {}

  @Get('batch')
  @UseGuards(CreApiKeyGuard)
  @ApiOperation({
    summary: 'Daily on-chain payout batch',
    description:
      'Returns today’s per-job aggregated cumulative views for the Chainlink ' +
      'CRE workflow to record on-chain. Authenticated via the ' +
      `\`${CRE_API_KEY_HEADER}\` header (machine-to-machine, not Privy). The ` +
      'snapshot is computed once per UTC day and persisted so every DON node ' +
      'receives an identical payload.',
  })
  @ApiOkResponse({ type: CreBatchResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRE API key.' })
  getBatch(): Promise<CreBatchResponseDto> {
    return this.creService.getDailyBatch();
  }
}
