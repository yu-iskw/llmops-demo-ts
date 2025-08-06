import { Client, Dataset } from "langsmith";
import { RequestAnswererInputs, RequestAnswererOutputs } from "@agents/secure_agent/subagents/answer_agent/eval/types";

const client = new Client();

export async function createAndAddExamples() {
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

  const examples: { inputs: RequestAnswererInputs; outputs: RequestAnswererOutputs }[] = [
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
        user_message: "Who developed the theory of relativity?",
      },
      outputs: {
        ai_response: "Albert Einstein developed the theory of relativity.",
      },
    },
    {
      inputs: {
        user_message: "What is the highest mountain in the world?",
      },
      outputs: {
        ai_response: "Mount Everest is the highest mountain in the world.",
      },
    },
    {
      inputs: {
        user_message: "How many planets are in our solar system?",
      },
      outputs: {
        ai_response: "There are eight planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.",
      },
    },
    {
      inputs: {
        user_message: "Explain quantum computing in simple terms.",
      },
      outputs: {
        ai_response: "Quantum computing is a new type of computing that uses the principles of quantum mechanics, like superposition and entanglement, to solve complex problems that classical computers cannot. It's still in its early stages but holds great promise for fields like medicine and materials science.",
      },
    },
    {
      inputs: {
        user_message: "What is the main ingredient in guacamole?",
      },
      outputs: {
        ai_response: "The main ingredient in guacamole is avocado.",
      },
    },
    {
      inputs: {
        user_message: "Can you provide a brief history of the internet?",
      },
      outputs: {
        ai_response: "The internet originated in the 1960s with ARPANET, a U.S. government project, and evolved significantly with the development of the World Wide Web in the late 1980s and early 1990s, becoming a global public resource.",
      },
    },
  ];

  await client.createExamples(
    examples.map((ex) => ({ ...ex, dataset_id: dataset.id })),
  );
  console.log("Dataset and examples created successfully.");
}

// createAndAddExamples().catch(console.error);
