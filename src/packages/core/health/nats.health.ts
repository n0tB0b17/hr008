import { HealthCheck, HealthCheckResult } from "./health.interface";

export class NatsHealthCheck implements HealthCheck {
    public readonly name = "nats";
    async check(): Promise<Omit<HealthCheckResult, "component">> {
        return {} as HealthCheckResult;
    }
}