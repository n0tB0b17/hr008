export interface ICacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
    del(key: string | string[]): Promise<void>;
    getWithPopulate<T>(
        key: string,
        fetchFn: () => Promise<T | null>,
        ttlSeconds?: number
    ): Promise<T | null>;
}