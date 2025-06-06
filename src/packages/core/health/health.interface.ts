import { HealthCheckType } from "../enums/healthcheck.enum";
import { ServiceComponents } from "../enums/service-component.enum";

interface HealthCheckResult {
    status: HealthCheckType
    component: ServiceComponents
    message?: string
    responseTime?: number
    details?: Record<string, any>;
}


interface HealthCheck {
    name: string;
    check(): Promise<Omit<HealthCheckResult, "component">>;
}

interface OverallHealthCheck {
    status: HealthCheckType
    timestamp: string
    checks: HealthCheckResult[];
}


export {
    HealthCheckResult,
    HealthCheck,
    OverallHealthCheck
}