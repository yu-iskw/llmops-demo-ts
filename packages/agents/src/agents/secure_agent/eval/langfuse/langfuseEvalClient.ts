import { LangfuseClient } from "@langfuse/client";

export function createLangfuseEvalClient(): LangfuseClient {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY?.trim();
  const secretKey = process.env.LANGFUSE_SECRET_KEY?.trim();

  if (!publicKey || !secretKey) {
    throw new Error(
      "Set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY for Langfuse dataset and experiment operations.",
    );
  }

  return new LangfuseClient({
    publicKey,
    secretKey,
    baseUrl: process.env.LANGFUSE_BASE_URL ?? "https://cloud.langfuse.com",
  });
}
