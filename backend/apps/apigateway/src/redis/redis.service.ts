import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
@Injectable()
export class RedisCacheService {
    private readonly redisClient: Redis;

    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {
        this.redisClient = this.redisService.getClient();
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        if(ttl) {
            await this.redisClient.set(key, stringValue, 'EX', ttl);
        }
        else {
            await this.redisClient.set(key, stringValue);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.redisClient.get(key);
        return data ? (JSON.parse(data) as T) : null;
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }
}
