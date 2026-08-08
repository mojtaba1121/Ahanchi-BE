import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.get(SeedService).run();
  await app.close();
}

void seed();
