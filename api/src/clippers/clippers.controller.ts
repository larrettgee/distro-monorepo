import {
  Body,
  Controller,
  Delete,
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
import { ClippersService } from './clippers.service';
import { ConnectChannelDto } from './dto/connect-channel.dto';
import {
  ClipperProfileResponseDto,
  StartConnectResponseDto,
} from './dto/clipper-profile-response.dto';

@ApiTags('clippers')
@ApiBearerAuth()
@UseGuards(PrivyAuthGuard, RolesGuard)
@Roles('clipper')
@Controller('clippers')
export class ClippersController {
  constructor(private readonly clippersService: ClippersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current clipper profile' })
  @ApiOkResponse({ type: ClipperProfileResponseDto })
  getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ClipperProfileResponseDto> {
    return this.clippersService.getMe(user.privyId);
  }

  @Post('channel/connect/start')
  @ApiOperation({
    summary: 'Start YouTube channel connection',
    description:
      'Issues a unique code to temporarily place in the channel bio for ownership verification.',
  })
  @ApiOkResponse({ type: StartConnectResponseDto })
  startConnect(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConnectChannelDto,
  ): Promise<StartConnectResponseDto> {
    return this.clippersService.startConnect(user.privyId, dto.channelUrl);
  }

  @Post('channel/connect/verify')
  @ApiOperation({
    summary: 'Verify YouTube channel connection',
    description:
      'Checks the channel bio for the issued code and adds the channel to the clipper.',
  })
  @ApiOkResponse({ type: ClipperProfileResponseDto })
  verifyConnect(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ClipperProfileResponseDto> {
    return this.clippersService.verifyConnect(user.privyId);
  }

  @Delete('channel/:channelId')
  @ApiOperation({
    summary: 'Disconnect a connected channel',
    description: 'Removes a previously verified channel from the clipper.',
  })
  @ApiOkResponse({ type: ClipperProfileResponseDto })
  disconnectChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('channelId') channelId: string,
  ): Promise<ClipperProfileResponseDto> {
    return this.clippersService.disconnectChannel(user.privyId, channelId);
  }
}
