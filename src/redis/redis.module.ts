import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [{
    provide: REDIS,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => new Redis(config.getOrThrow<string>('REDIS_URL'), {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    }),
  }],
  exports: [REDIS],
})
export class RedisModule {}
