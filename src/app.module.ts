import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ProgressModule } from './progress/progress.module';
import keycloakConfig from './config/keycloak.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [keycloakConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ProgressModule,
  ],
})
export class AppModule {}
