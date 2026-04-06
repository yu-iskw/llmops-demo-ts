import { Client } from "langsmith";

export interface LangSmithEvalClientOptions {
  /**
   * When set, assigns LANGCHAIN_PROJECT for tracing and eval metadata.
   * Omit to leave LANGCHAIN_PROJECT unchanged (only API key / endpoint are configured).
   */
  defaultProject?: string;
}

/**
 * Builds a LangSmith {@link Client} for eval dataset scripts with explicit credentials.
 * Resolves API key from LANGSMITH_API_KEY or LANGCHAIN_API_KEY (either is valid) and
 * never overwrites LANGCHAIN_API_KEY with undefined.
 */
export function createLangSmithEvalClient(
  options?: LangSmithEvalClientOptions,
): Client {
  const apiKey =
    process.env.LANGSMITH_API_KEY?.trim() ||
    process.env.LANGCHAIN_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Set LANGSMITH_API_KEY or LANGCHAIN_API_KEY for LangSmith dataset operations.",
    );
  }

  const apiUrl =
    process.env.LANGSMITH_ENDPOINT ?? "https://api.smith.langchain.com";

  process.env.LANGCHAIN_API_KEY = apiKey;
  if (!process.env.LANGSMITH_API_KEY) {
    process.env.LANGSMITH_API_KEY = apiKey;
  }
  process.env.LANGSMITH_ENDPOINT = apiUrl;
  process.env.LANGCHAIN_TRACING_V2 = "true";

  if (options?.defaultProject) {
    process.env.LANGCHAIN_PROJECT = options.defaultProject;
  }

  return new Client({ apiKey, apiUrl });
}

function getErrorStatus(error: unknown): number | undefined {
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

/**
 * Wraps dataset API work to attach troubleshooting hints for common HTTP failures.
 */
export async function runLangSmithDatasetOperation<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (getErrorStatus(error) === 403) {
      throw new Error(
        "LangSmith returned 403 Forbidden for a dataset API call. Check that your API key can list and create datasets in this workspace, LANGSMITH_ENDPOINT matches your region or self-hosted URL, and RBAC allows dataset access. See routed_agent/README.md and secure_agent/README.md (Troubleshooting).",
        { cause: error },
      );
    }
    throw error;
  }
}
