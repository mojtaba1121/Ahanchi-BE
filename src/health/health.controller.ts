import { Controller, Get, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import { Public } from '../common/decorators/public.decorator';
import { REDIS } from '../redis/redis.module';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongo: Connection,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  @Public()
  @Get()
  async health() {
    let redis = 'down';
    try { redis = (await this.redis.ping()) === 'PONG' ? 'up' : 'down'; } catch { /* reported below */ }
    const mongo = this.mongo.readyState === 1 ? 'up' : 'down';
    return { status: mongo === 'up' && redis === 'up' ? 'ok' : 'degraded', mongo, redis, timestamp: new Date().toISOString() };
  }
}
