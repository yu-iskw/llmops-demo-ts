import {
  OutputSanitizerStateAnnotation,
  OutputSanitizerOutput,
} from "./outputSanitizerState";
import { GoogleGenAI, Type } from "@google/genai";
import { createConversationContents } from "../../../../utils/agentUtilities";
import { logger } from "@llmops-demo/common";

function clampUnitInterval(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  return Math.min(1, Math.max(0, value));
}

/** Prefer SDK aggregate text; fall back to plain text parts (e.g. some Gemini 3.x responses). */
function extractResponseTextForJson(result: {
  text?: string | undefined;
  candidates?: ReadonlyArray<{
    content?: { parts?: ReadonlyArray<{ text?: string }> };
    finishReason?: string;
  }>;
}): string | undefined {
  const direct = result.text?.trim();
  if (direct) {
    return direct;
  }
  const parts = result.candidates?.[0]?.content?.parts;
  if (!parts?.length) {
    return undefined;
  }
  const joined = parts
    .map((p) => p.text)
    .filter((t): t is string => typeof t === "string" && t.length > 0)
    .join("");
  return joined.trim() || undefined;
}

function parseJsonObject(raw: string): unknown {
  let s = raw.trim();
  if (s.startsWith("```")) {
    const firstLineBreak = s.indexOf("\n");
    if (firstLineBreak !== -1) {
      s = s.slice(firstLineBreak + 1);
    }
    const closingFence = s.lastIndexOf("```");
    if (closingFence !== -1) {
      s = s.slice(0, closingFence).trim();
    }
  }
  return JSON.parse(s);
}

export const checkOutput = async (
  state: typeof OutputSanitizerStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    const contents = createConversationContents(
      state.messages || [],
      state.ai_response || "", // Use ai_response as the input for sanitization, with default
      state.messageWindowSize,
    );

    const result = await genAI.models.generateContent({
      model: modelName,
      contents,
      config: {
        // Gemini 3.x may use thinking by default; disable so structured JSON lands in response text.
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction:
          "You are an output sanitizer. Classify the given assistant output as SAFE or SENSITIVE. If sensitive, give a brief reason in reason; if safe, use an empty string for reason. " +
          "confidenceProbability is your confidence in [0,1] that the isSensitive label is correct. " +
          "suspiciousProbability is your estimated probability in [0,1] that the output is sensitive or should be blocked. " +
          "Respond with JSON only matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSensitive: {
              type: Type.BOOLEAN,
              description: "Whether the output is sensitive",
            },
            reason: {
              type: Type.STRING,
              description: "The reason for the classification",
            },
            confidenceProbability: {
              type: Type.NUMBER,
              description:
                "Confidence in [0,1] that the isSensitive classification is correct",
            },
            suspiciousProbability: {
              type: Type.NUMBER,
              description:
                "Estimated probability in [0,1] that the output is sensitive",
            },
          },
          required: [
            "isSensitive",
            "reason",
            "confidenceProbability",
            "suspiciousProbability",
          ],
        },
      },
    });

    const rawText = extractResponseTextForJson(result);
    if (!rawText) {
      const finish = result.candidates?.[0]?.finishReason;
      const finishSuffix = finish ? " finishReason=" + finish : "";
      logger.error(
        "Output sanitizer: empty model text after generateContent" +
          finishSuffix,
      );
      throw new Error("Empty model response for output sanitizer");
    }

    const parsedResult = parseJsonObject(rawText) as OutputSanitizerOutput;
    const isSensitive = parsedResult.isSensitive;
    let feedbackMessage = isSensitive ? parsedResult.reason : undefined;
    const confidenceProbability = clampUnitInterval(
      parsedResult.confidenceProbability,
    );
    const suspiciousProbability = clampUnitInterval(
      parsedResult.suspiciousProbability,
    );

    logger.info(
      `Output check result: ${isSensitive ? "SENSITIVE" : "SAFE"}, Reason: ${feedbackMessage || "N/A"}, confidence=${confidenceProbability ?? "n/a"}, suspicious=${suspiciousProbability ?? "n/a"}`,
    );

    return {
      is_sensitive: isSensitive,
      feedback_message: feedbackMessage,
      confidence_probability: confidenceProbability,
      suspicious_probability: suspiciousProbability,
      ai_response: state.ai_response, // Return original AI response
      messages: state.messages, // Keep the existing messages, do not modify here
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error checking output: ${message}`, error);
    return {
      is_sensitive: true,
      feedback_message:
        "An error occurred while checking the output for sensitive information.",
      confidence_probability: undefined,
      suspicious_probability: undefined,
      ai_response: state.ai_response, // Return original AI response
      messages: state.messages, // Keep original messages
    };
  }
};
