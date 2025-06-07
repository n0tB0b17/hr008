import { HealthCheck, HealthCheckResult } from "../interface/health.interface";


export class RedisHealthCheck implements HealthCheck {
    public readonly name = "redis";

    async check(): Promise<Omit<HealthCheckResult, "component">> {
        return {} as HealthCheckResult;
    }
}