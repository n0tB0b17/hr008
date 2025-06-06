import { HealthCheck, HealthCheckResult } from "./health.interface";

export class PgHealthCheck implements HealthCheck {
    public readonly name = "postgres";

    async check(): Promise<Omit<HealthCheckResult, "component">> {
        return {} as HealthCheckResult;
    }
}