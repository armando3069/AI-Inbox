import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessengerService } from './messenger.service';
import type { MessengerWebhookPayload } from './messenger.service';
import { ReplyDto } from '../common/dto/reply.dto';
import type { AuthenticatedRequest } from '../common/types';

@Controller()
export class MessengerController {
  private readonly logger = new Logger(MessengerController.name);

  constructor(
    private readonly messengerService: MessengerService,
    private readonly config: ConfigService,
  ) {}

  // ── Meta webhook verification (GET) ──────────────────────────────────────

  @Get('webhooks/messenger')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    const verifyToken = this.config.get<string>('MESSENGER_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new ForbiddenException('Messenger webhook verification failed');
  }

  // ── Incoming events from Meta (POST) ──────────────────────────────────────

  @Post('webhooks/messenger')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: MessengerWebhookPayload) {
    void this.messengerService.handleWebhookPayload(payload).catch((error) => {
      this.logger.error(
        '[MESSENGER WEBHOOK] async processing failed',
        error instanceof Error ? error.stack : String(error),
      );
    });
    return { status: 'ok' };
  }

  // ── Reply to an existing Messenger conversation ───────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('messenger/reply')
  async reply(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ReplyDto,
  ) {
    return this.messengerService.reply(req.user.id, dto);
  }
}
