import type { SecureEvalDatasetSpec } from "../secureEvalDatasetSpec";
import { pushSecureEvalDatasetToLangfuse } from "./pushSecureEvalDatasetToLangfuse";

const SECURE_ANSWER_AGENT_LLM_JUDGE_LANGFUSE_DATASET_NAME =
  "Secure Agent Request Answerer LLM Judge Dataset";

function buildAnswerAgentLlmJudgeSpec(): SecureEvalDatasetSpec {
  const rows: SecureEvalDatasetSpec["examples"] = [
    {
      id: "llm-intro",
      input: {
        user_message: "Tell me about large language models.",
      },
      expectedOutput: {
        ai_response:
          "Large language models (LLMs) are deep learning models that can recognize, summarize, translate, predict, and generate text and other content based on knowledge gained from massive datasets.",
      },
    },
    {
      id: "capital-france",
      input: {
        user_message: "What is the capital of France?",
      },
      expectedOutput: {
        ai_response: "The capital of France is Paris.",
      },
    },
    {
      id: "knight-story",
      input: {
        user_message: "Write a short story about a brave knight.",
      },
      expectedOutput: {
        ai_response:
          "In a kingdom far away, lived Sir Reginald, a knight known for his unwavering courage. One day, a dragon terrorized the village, and Reginald, with his trusty sword, faced the beast. After a fierce battle, he emerged victorious, saving his people and becoming a legend.",
      },
    },
    {
      id: "quantum",
      input: {
        user_message: "Explain the concept of quantum entanglement.",
      },
      expectedOutput: {
        ai_response:
          "Quantum entanglement is a phenomenon where two or more particles become linked in such a way that they share the same fate, no matter how far apart they are. Measuring the property of one entangled particle instantaneously influences the property of the other, even if they are light-years apart. This 'spooky action at a distance' baffled Einstein himself.",
      },
    },
    {
      id: "ai-benefits",
      input: {
        user_message: "What are the benefits of artificial intelligence?",
      },
      expectedOutput: {
        ai_response:
          "Artificial intelligence (AI) offers numerous benefits, including automation of repetitive tasks, enhanced data analysis, improved decision-making, and the development of intelligent systems that can learn and adapt. AI is transforming industries from healthcare to finance, driving innovation and efficiency.",
      },
    },
  ];

  return {
    datasetName: SECURE_ANSWER_AGENT_LLM_JUDGE_LANGFUSE_DATASET_NAME,
    description:
      "Dataset for evaluating the secure agent request answerer (single-turn, Langfuse).",
    metadata: { agent: "secure", suite: "answer-llm-judge" },
    examples: rows,
  };
}

export async function createAndAddExamples(): Promise<string> {
  const spec = buildAnswerAgentLlmJudgeSpec();
  return pushSecureEvalDatasetToLangfuse(
    spec,
    "Secure agent answer agent LLM-judge dataset examples synced to Langfuse.",
  );
}
