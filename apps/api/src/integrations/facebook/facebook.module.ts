import { Module } from '@nestjs/common';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';
import { FacebookGraphClient } from './facebook-graph.client';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { TokenCryptoModule } from '../../common/security/token-crypto.module';

@Module({
  imports: [PrismaModule, AuthModule, TokenCryptoModule],
  controllers: [FacebookController],
  providers: [FacebookService, FacebookGraphClient],
  exports: [FacebookService],
})
export class FacebookModule {}
