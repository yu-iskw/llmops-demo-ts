import { Client, Dataset } from "langsmith";
import { ChatCompletionMessage } from "openevals";

const client = new Client();

export async function createAndAddExamples(): Promise<string> {
  let dataset: Dataset | undefined;
  const datasetName = "Answer Agent Dataset (Multi-turn)";

  for await (const existingDataset of client.listDatasets({ datasetName })) {
    dataset = existingDataset;
    console.log(
      `Dataset "${datasetName}" already exists with ID: ${dataset.id}. Reusing existing dataset.`,
    );
    break; // Found the dataset, no need to continue iterating
  }

  if (!dataset) {
    dataset = await client.createDataset(datasetName, {
      description:
        "Dataset for evaluating the multi-turn request answerer subagent.",
    });
    console.log(`Dataset "${datasetName}" created with ID: ${dataset.id}.`);
  }

  const examples: {
    inputs: {
      messages: ChatCompletionMessage[];
      simulated_user_prompt: string;
    };
  }[] = [
    {
      inputs: {
        messages: [
          { role: "user", content: "Tell me about large language models." },
        ],
        simulated_user_prompt:
          "You are a curious user who asks follow-up questions.",
      },
    },
    {
      inputs: {
        messages: [{ role: "user", content: "What is the capital of France?" }],
        simulated_user_prompt: "You are a user who quickly changes topics.",
      },
    },
    {
      inputs: {
        messages: [
          { role: "user", content: "Who developed the theory of relativity?" },
        ],
        simulated_user_prompt:
          "You are a user who challenges the AI\'s answers.",
      },
    },
    {
      inputs: {
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
      inputs: {
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
      inputs: {
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

  await client.createExamples(
    examples.map((ex) => ({ ...ex, dataset_id: dataset.id })),
  );
  console.log("Dataset and examples created successfully.");
  return dataset.id;
}

// createAndAddExamples().catch(console.error);
