import { Command } from "commander";
import { SecureAgent } from "./secureAgent"; // Import DefaultAgent
import { createGenAIClient, GenAIConfig } from "../../utils/genai"; // Import GenAI utilities

const secureAgentProgram = new Command();

secureAgentProgram
  .name("secure-agent")
  .description("CLI for interacting with the Secure Agent")
  .version("1.0.0");


secureAgentProgram
  .command("run")
  .description("Run the Secure agent")
  .option("-m, --model [model]", "Model to use", "gemini-2.5-flash")
  .option("-p, --project [project]", "Project to use")
  .option("-l, --location [location]", "Location to use")
  .requiredOption("-t, --text <message>", "The message to send to the agent")
  .action(
    async (
      options: { model: string; project: string; location: string; text: string },
    ) => {
      console.log(`Sending message to Secure Agent: \"${options.text}\"`);
      console.log(`Options received:`, options);
      const { project, location, model, text: message } = options;

      // Initialize GenAI client
      const genAIConfig: GenAIConfig = {};
      if (project) genAIConfig.project = project;
      if (location) genAIConfig.location = location;

      const genAI = createGenAIClient(genAIConfig);
      const secureAgent = new SecureAgent();

      const response = await secureAgent.processMessage(
        message,
        [], // history
        genAIConfig,
        model,
        undefined, // sessionId
      );
      console.log("Default Agent Response:", response);
    },
  );

export { secureAgentProgram };
