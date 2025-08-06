import "module-alias/register";
import { Command } from "commander";
import { ResearchAgent } from "./researchAgent"; // Import DefaultAgent
import { createGenAIClient, GenAIConfig } from "../../utils/genai"; // Import GenAI utilities

const researchAgentProgram = new Command();

researchAgentProgram
  .name("research-agent")
  .description("CLI for interacting with the Research Agent")
  .version("1.0.0");


researchAgentProgram
  .command("run")
  .description("Run the Research agent")
  .option("-m, --model [model]", "Model to use", "gemini-2.5-flash")
  .option("-p, --project [project]", "Project to use")
  .option("-l, --location [location]", "Location to use")
  .requiredOption("-t, --text <message>", "The message to send to the agent")
  .action(
    async (
      options: { model: string; project: string; location: string; text: string },
    ) => {
      console.log(`Sending message to Research Agent: \"${options.text}\"`);
      console.log(`Options received:`, options);
      const { project, location, model, text: message } = options;

      // Initialize GenAI client
      const genAIConfig: GenAIConfig = {};
      if (project) genAIConfig.project = project;
      if (location) genAIConfig.location = location;

      const genAI = createGenAIClient(genAIConfig);
      const researchAgent = new ResearchAgent();

      const response = await researchAgent.processMessage(
        message,
        [], // history
        genAIConfig,
        model,
        undefined, // sessionId
      );
      console.log("Default Agent Response:", response);
    },
  );

export { researchAgentProgram };
