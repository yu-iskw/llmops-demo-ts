import { Command } from "commander";
import { DefaultAgent } from "./defaultAgent"; // Import DefaultAgent
import { GenAIConfig } from "../../utils/genai"; // Import GenAI utilities
import dotenv from "dotenv";
import { getProjectRootPath } from "../../utils/utilities";
import path from "path";

// Load environment variables from the root of the package
dotenv.config({
  path: path.resolve(getProjectRootPath(), ".env"),
  debug: true,
});

const defaultAgentProgram = new Command();

defaultAgentProgram
  .name("default-agent")
  .description("CLI for interacting with the Default Agent")
  .version("1.0.0");

defaultAgentProgram
  .command("run")
  .description("Run the Default agent")
  .option("-m, --model [model]", "Model to use", "gemini-2.5-flash")
  .option("-p, --project [project]", "Project to use")
  .option("-l, --location [location]", "Location to use")
  .requiredOption("-t, --text <message>", "The message to send to the agent")
  .action(
    async (options: {
      model: string;
      project: string;
      location: string;
      text: string;
    }) => {
      console.log(`Sending message to Default Agent: \"${options.text}\"`);
      console.log(`Options received:`, options);
      const { project, location, model, text: message } = options;

      // Initialize GenAI client
      const genAIConfig: GenAIConfig = {};
      if (project) genAIConfig.project = project;
      if (location) genAIConfig.location = location;

      const defaultAgent = new DefaultAgent();

      const responseStream = defaultAgent.processMessage(
        message,
        [], // history
        genAIConfig,
        model,
        undefined, // sessionId
      );

      process.stdout.write("Default Agent Response:\n");
      for await (const chunk of responseStream) {
        if (chunk && chunk.content && typeof chunk.content === "string") {
          process.stdout.write(chunk.content);
        }
      }
      process.stdout.write("\n");
    },
  );

export { defaultAgentProgram };
