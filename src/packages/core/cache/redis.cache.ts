import { Redis } from "ioredis";
import { ICacheService } from "./cache.interface";
import { RedisOptions } from "ioredis";


export class RedisCacheService implements ICacheService {
    private client: Redis;

    constructor(options?: RedisOptions) {
        this.client = new Redis(options || {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379", 10)
        })

        this.client.on('error', (error: Error) => {
            console.log(`Unable to connect to redis server: ${error.message}`);
        });

        this.client.on('connect', () => console.log(`Connected to redis server`));
    }


    async get<T>(key: string): Promise<T | null> {
        try {
            const resp = await this.client.get(key);
            return resp ? JSON.parse(resp) as T : null
        } catch (e: any) {
            console.log(`[Cache:Get] > unexpected error: ${e.message}`)
            return null;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const stringValue: string = JSON.stringify(value);
        try {
            if (ttlSeconds) {
                await this.client.set(key, stringValue, "EX", ttlSeconds);
            } else {
                await this.client.set(key, stringValue);
            }
        } catch (e: any) {
            console.log(`[Cache:Set] > unexpected error: ${e.message}`);
        }
    }

    async del(key: string | string[]): Promise<void> {
        try {
            if (Array.isArray(key) && key.length > 0) {
                await this.client.del(...key);
            } else if (typeof key === 'string') {
                await this.client.del(key);
            }
        } catch (e: any) {
            console.log(`[Cache:Del] > unexpected error: ${e.message}`);
        }
    }


    async getWithPopulate<T>(key: string, fetchFn: () => Promise<T | null>, ttlSeconds?: number): Promise<T | null> {
        let data = await this.get<T>(key);
        if (data !== null) {
            return data;
        }

        data = await fetchFn();
        if (data !== null) {
            await this.set<T>(key, data, ttlSeconds);
        }
        return data;
    }

    getClient(): Redis {
        return this.client;
    }
}

export const cacheService = new RedisCacheService();