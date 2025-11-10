import { AIMessage } from "@langchain/core/messages";
import { SearchAgentStateAnnotation } from "./researchAgentState";
import { GoogleGenAI } from "@google/genai";
import { logger } from "@llmops-demo/common";

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
  for (let index_ = 0; index_ < limit && index_ < tasks.length; index_++) {
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

// Node for planning search queries
export const planQueries = async (
  state: typeof SearchAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    const prompt = `Return the queries as a JSON array of strings under the key "queries".\nUser question: ${state.user_message}\nExample: { "queries": ["weather in Tokyo tomorrow", "weather in London tomorrow"] }`;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction:
          "You are a helpful assistant that generates search queries to answer a user's question.",
      },
    });

    let jsonString = result.text || "";
    const match = jsonString.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      jsonString = match[1];
    }

    const queries = jsonString ? JSON.parse(jsonString).queries : [];

    logger.info(`Generated ${queries.length} search queries`);

    return { search_queries: queries };
  } catch (error) {
    logger.error("Error planning queries:", error);

    // Provide a fallback response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const aiMessage = new AIMessage(
      `I apologize, but I encountered an error while planning search queries: ${errorMessage}. Please try again or rephrase your question.`,
    );

    return {
      search_queries: [],
      messages: [aiMessage],
    };
  }
};

// Node for executing searches
export const executeSearches = async (
  state: typeof SearchAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    if (!state.search_queries || state.search_queries.length === 0) {
      logger.warn("No search queries to execute");
      return {
        search_results: [],
        messages: [
          new AIMessage("No search queries were generated to execute."),
        ],
      };
    }

    const searchTasks = state.search_queries.map((query) => async () => {
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: `Search for: ${query}` }] }],
        config: {
          systemInstruction:
            "You are a helpful assistant that performs web searches to find relevant information.",
          tools: [{ googleSearch: {} }],
        },
      });
      return { query, result: response.text || "No result." };
    });

    logger.info(`Executing ${state.search_queries.length} search queries`);
    const searchResults = await runWithConcurrencyLimit(searchTasks, 5);

    logger.info(`Completed ${searchResults.length} searches successfully`);
    return { search_results: searchResults };
  } catch (error) {
    logger.error("Error executing searches:", error);

    // Provide a fallback response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const aiMessage = new AIMessage(
      `I apologize, but I encountered an error while executing searches: ${errorMessage}. Please try again.`,
    );

    return {
      search_results: [],
      messages: [aiMessage],
    };
  }
};

// Node for synthesizing results
export const synthesizeResults = async (
  state: typeof SearchAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    if (!state.search_results || state.search_results.length === 0) {
      logger.warn("No search results to synthesize");
      const aiMessage = new AIMessage(
        "I couldn't find any search results to synthesize. Please try rephrasing your question.",
      );
      return {
        response: aiMessage.content as string,
        messages: [aiMessage],
      };
    }

    const searchResultsText = state.search_results
      .map((result) => `Query: ${result.query}\nResult: ${result.result}`)
      .join("\n\n");

    const prompt = `Synthesize the following search results to answer the user's original question.\nOriginal question: ${state.user_message}\nSearch results:\n${searchResultsText}\n\nSynthesized Answer:`;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction:
          "You are a helpful assistant that synthesizes search results to provide comprehensive answers to user questions.",
      },
    });
    const finalResponse = result.text || "";

    logger.info("Synthesis completed successfully");

    return {
      response: finalResponse,
      messages: [new AIMessage({ content: finalResponse })],
    };
  } catch (error) {
    logger.error("Error synthesizing results:", error);

    // Provide a fallback response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const aiMessage = new AIMessage(
      `I apologize, but I encountered an error while synthesizing the search results: ${errorMessage}. Please try again.`,
    );

    return {
      response: aiMessage.content as string,
      messages: [aiMessage],
    };
  }
};
