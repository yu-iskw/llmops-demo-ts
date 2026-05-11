import { createLangfuseEvalClient } from "../langfuseEvalClient";
import type { SecureEvalDatasetSpec } from "../secureEvalDatasetSpec";
import { secureEvalDatasetItemId } from "../secureEvalDatasetItemId";

function getHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const record = error as Record<string, unknown>;
  if (typeof record.status === "number") {
    return record.status;
  }
  const cause = record.cause;
  if (cause && typeof cause === "object" && cause !== null) {
    const causeRecord = cause as Record<string, unknown>;
    if (typeof causeRecord.status === "number") {
      return causeRecord.status;
    }
  }
  return undefined;
}

function isDatasetConflictError(error: unknown): boolean {
  const status = getHttpStatus(error);
  if (status === 409) {
    return true;
  }
  if (status === 400 || status === 422) {
    const message = String((error as Error).message ?? "").toLowerCase();
    return (
      message.includes("already exists") ||
      message.includes("duplicate") ||
      message.includes("unique")
    );
  }
  return false;
}

/**
 * Creates or reuses a Langfuse dataset and upserts items from a secure-agent eval spec.
 * Returns the dataset name for `langfuse.dataset.get(...)`.
 */
export async function pushSecureEvalDatasetToLangfuse(
  spec: SecureEvalDatasetSpec,
  successLogMessage: string,
): Promise<string> {
  const langfuse = createLangfuseEvalClient();

  try {
    await langfuse.api.datasets.create({
      name: spec.datasetName,
      description: spec.description,
      metadata: spec.metadata,
    });
    console.log(`Langfuse dataset "${spec.datasetName}" created.`);
  } catch (error) {
    if (!isDatasetConflictError(error)) {
      throw error;
    }
    console.log(
      `Langfuse dataset "${spec.datasetName}" already exists. Reusing.`,
    );
  }

  for (const [index, example] of spec.examples.entries()) {
    await langfuse.api.datasetItems.create({
      id: secureEvalDatasetItemId(spec.datasetName, example.id, index),
      datasetName: spec.datasetName,
      input: example.input,
      ...(example.expectedOutput !== undefined
        ? { expectedOutput: example.expectedOutput }
        : {}),
      metadata: example.metadata,
    });
  }

  await langfuse.flush();
  console.log(successLogMessage);
  return spec.datasetName;
}
