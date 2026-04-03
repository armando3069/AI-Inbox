import { Module, forwardRef } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { AiAssistantModule } from '../ai-assistant/ai-assistant.module';
import { TokenCryptoModule } from '../common/security/token-crypto.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TokenCryptoModule,
    forwardRef(() => ChatModule),
    forwardRef(() => AiAssistantModule),
  ],
  controllers: [MessengerController],
  providers: [MessengerService],
  exports: [MessengerService],
})
export class MessengerModule {}
