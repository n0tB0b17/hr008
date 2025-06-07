import { HealthCheck, HealthCheckResult } from "../interface/health.interface";

export class NatsHealthCheck implements HealthCheck {
    public readonly name = "nats";
    async check(): Promise<Omit<HealthCheckResult, "component">> {
        return {} as HealthCheckResult;
    }
}