import { SearchAgentState } from "./state";
import {
  GoogleGenAI,
  FunctionDeclaration,
  Part,
  Content,
  Tool,
  FunctionCall,
} from "@google/genai";
import {
  HumanMessage,
  AIMessage,
  FunctionMessage,
  BaseMessage,
} from "@langchain/core/messages";

interface CustomToolCall {
  name: string;
  args: Record<string, any>;
}

// Helper to run promises with a concurrency limit
async function runWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  let index = 0;

  function enqueue() {
    if (index < tasks.length) {
      const task = tasks[index++];
      const promise = task().then((result) => {
        results.push(result);
        executing.splice(executing.indexOf(currentPromise), 1);
      });
      const currentPromise = promise.then(
        () => {},
        () => {},
      ); // Handle potential rejections to avoid unhandled promise rejections
      executing.push(currentPromise);
      return currentPromise;
    }
    return null;
  }

  // Start initial tasks up to the limit
  for (let i = 0; i < limit && i < tasks.length; i++) {
    enqueue();
  }

  // Await completion of all tasks
  while (executing.length > 0) {
    await Promise.race(executing);
    // After a promise settles, try to enqueue another task
    const nextTask = enqueue();
    if (nextTask) {
      await nextTask; // Wait for the newly enqueued task to start and settle, or immediately proceed if it's not a new task
    }
  }

  return results;
}

// Helper to extract string content from BaseMessage.content
function getContentAsString(content: BaseMessage["content"]): string {
  if (typeof content === "string") {
    return content;
  } else if (Array.isArray(content)) {
    // Attempt to join text parts, or stringify objects
    return content
      .map((part) => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");
  }
  return "";
}

// Node for planning search queries
export const planQueries = async (
  state: SearchAgentState,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  const prompt = `You are a helpful assistant that generates search queries to answer a user's question.\nReturn the queries as a JSON array of strings under the key "queries".\nUser question: ${state.user_message}\nExample: { "queries": ["weather in Tokyo tomorrow", "weather in London tomorrow"] }`;

  const result = await genAI.models.generateContent({
    model: modelName,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let jsonString = result.text || "";
  const match = jsonString.match(/```json\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    jsonString = match[1];
  }

  const queries = jsonString ? JSON.parse(jsonString).queries : [];

  return { search_queries: queries };
};

// Node for executing searches
export const executeSearches = async (
  state: SearchAgentState,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  const searchTasks = state.search_queries.map((query) => async () => {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: `Search for: ${query}` }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return { query, result: response.text || "No result." };
  });

  const searchResults = await runWithConcurrencyLimit(searchTasks, 5);

  return { search_results: searchResults };
};

// Node for synthesizing results
export const synthesizeResults = async (
  state: SearchAgentState,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  const searchResultsText = state.search_results
    .map((res) => `Query: ${res.query}\nResult: ${res.result}`)
    .join("\n\n");

  const prompt = `You are a helpful assistant. Synthesize the following search results to answer the user's original question.\nOriginal question: ${state.user_message}\nSearch results:\n${searchResultsText}\n\nSynthesized Answer:`;

  const result = await genAI.models.generateContent({
    model: modelName,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  const finalResponse = result.text || "";

  return {
    response: finalResponse,
    messages: [new AIMessage({ content: finalResponse })],
  };
};
