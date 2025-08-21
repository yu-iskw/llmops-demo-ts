import { Client, Dataset } from "langsmith";
import { RequestAnswererInputs, RequestAnswererOutputs } from "./types";

const client = new Client();

export async function createAndAddExamples(): Promise<string> {
  let dataset: Dataset | undefined;
  const datasetName = "Request Answerer Dataset";

  for await (const existingDataset of client.listDatasets({ datasetName })) {
    dataset = existingDataset;
    console.log(
      `Dataset "${datasetName}" already exists with ID: ${dataset.id}. Reusing existing dataset.`,
    );
    break; // Found the dataset, no need to continue iterating
  }

  if (!dataset) {
    dataset = await client.createDataset(datasetName, {
      description: "Dataset for evaluating the request answerer subagent.",
    });
    console.log(`Dataset "${datasetName}" created with ID: ${dataset.id}.`);
  }

  const examples: {
    inputs: RequestAnswererInputs;
    outputs: RequestAnswererOutputs;
  }[] = [
    {
      inputs: {
        user_message: "Tell me about large language models.",
      },
      outputs: {
        ai_response:
          "Large language models (LLMs) are deep learning models that can recognize, summarize, translate, predict, and generate text and other content based on knowledge gained from massive datasets.",
      },
    },
    {
      inputs: {
        user_message: "What is the capital of France?",
      },
      outputs: {
        ai_response: "The capital of France is Paris.",
      },
    },
    {
      inputs: {
        user_message: "Write a short story about a brave knight.",
      },
      outputs: {
        ai_response:
          "In a kingdom far away, lived Sir Reginald, a knight known for his unwavering courage. One day, a dragon terrorized the village, and Reginald, with his trusty sword, faced the beast. After a fierce battle, he emerged victorious, saving his people and becoming a legend.",
      },
    },
    {
      inputs: {
        user_message: "Explain the concept of quantum entanglement.",
      },
      outputs: {
        ai_response:
          "Quantum entanglement is a phenomenon where two or more particles become linked in such a way that they share the same fate, no matter how far apart they are. Measuring the property of one entangled particle instantaneously influences the property of the other, even if they are light-years apart. This 'spooky action at a distance' baffled Einstein himself.",
      },
    },
    {
      inputs: {
        user_message: "What are the benefits of artificial intelligence?",
      },
      outputs: {
        ai_response:
          "Artificial intelligence (AI) offers numerous benefits, including automation of repetitive tasks, enhanced data analysis, improved decision-making, and the development of intelligent systems that can learn and adapt. AI is transforming industries from healthcare to finance, driving innovation and efficiency.",
      },
    },
  ];

  await client.createExamples(
    examples.map((ex) => ({ ...ex, dataset_id: dataset.id })),
  );
  console.log("Dataset and examples created successfully.");
  return dataset.id;
}
