import type { SecureEvalDatasetSpec } from "../secureEvalDatasetSpec";
import { pushSecureEvalDatasetToLangfuse } from "./pushSecureEvalDatasetToLangfuse";

const SECURE_ANSWER_AGENT_MULTI_TURN_LANGFUSE_DATASET_NAME =
  "Secure Agent Answer Multi-turn Dataset";

function buildAnswerAgentMultiTurnSpec(): SecureEvalDatasetSpec {
  const rows: SecureEvalDatasetSpec["examples"] = [
    {
      id: "llm-curious",
      input: {
        messages: [
          { role: "user", content: "Tell me about large language models." },
        ],
        simulated_user_prompt:
          "You are a curious user who asks follow-up questions.",
      },
    },
    {
      id: "capital-topic-switch",
      input: {
        messages: [{ role: "user", content: "What is the capital of France?" }],
        simulated_user_prompt: "You are a user who quickly changes topics.",
      },
    },
    {
      id: "relativity",
      input: {
        messages: [
          { role: "user", content: "Who developed the theory of relativity?" },
        ],
        simulated_user_prompt:
          "You are a user who challenges the AI's answers.",
      },
    },
    {
      id: "react-debug",
      input: {
        messages: [
          {
            role: "user",
            content: "I need help debugging my React application.",
          },
        ],
        simulated_user_prompt:
          "You are a developer seeking technical assistance.",
      },
    },
    {
      id: "ai-regulations",
      input: {
        messages: [
          {
            role: "user",
            content: "Can you summarize the latest news about AI regulations?",
          },
        ],
        simulated_user_prompt:
          "You are a policy analyst needing concise information.",
      },
    },
    {
      id: "secure-python",
      input: {
        messages: [
          {
            role: "user",
            content: "What are the best practices for secure coding in Python?",
          },
        ],
        simulated_user_prompt:
          "You are a cybersecurity expert testing the AI's knowledge.",
      },
    },
  ];

  return {
    datasetName: SECURE_ANSWER_AGENT_MULTI_TURN_LANGFUSE_DATASET_NAME,
    description:
      "Dataset for evaluating the secure agent multi-turn answerer (Langfuse).",
    metadata: { agent: "secure", suite: "answer-multi-turn" },
    examples: rows,
  };
}

export async function createAndAddExamples(): Promise<string> {
  const spec = buildAnswerAgentMultiTurnSpec();
  return pushSecureEvalDatasetToLangfuse(
    spec,
    "Secure agent answer multi-turn dataset examples synced to Langfuse.",
  );
}
