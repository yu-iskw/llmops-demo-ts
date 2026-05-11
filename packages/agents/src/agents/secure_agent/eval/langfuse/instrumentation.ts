import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

/**
 * Builds a new SDK for each tracing cycle. After `NodeSDK.shutdown()`, OTEL /
 * Langfuse processors must not be restarted on the same instance (e.g.
 * "MetricReader can not be bound to a MeterProvider again"). Sequential
 * `eval-langfuse` runs one suite per cycle, each calling shutdown in `finally`.
 */
function createLangfuseOtelSdk(): NodeSDK {
  return new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()],
  });
}

let langfuseOtelSdk = createLangfuseOtelSdk();

let tracingStarted = false;

export function startLangfuseTracing(): void {
  if (tracingStarted) {
    return;
  }
  langfuseOtelSdk.start();
  tracingStarted = true;
}

export async function shutdownLangfuseTracing(): Promise<void> {
  if (!tracingStarted) {
    return;
  }
  await langfuseOtelSdk.shutdown();
  tracingStarted = false;
  langfuseOtelSdk = createLangfuseOtelSdk();
}
