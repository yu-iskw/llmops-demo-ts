import "module-alias/register";
import { Command } from "commander";
import { ChatService } from "./services/chatService";
import dotenv from "dotenv";
import { getPackageRootPath } from "./utils/utils";
import path from "path";
import { initializeGenAIClient } from "./utils/genai";
import { defaultAgentProgram } from "./agents/default_agent/cli";

// Load environment variables from the root of the package
dotenv.config({
  path: path.resolve(getPackageRootPath(), "../../.env"),
  debug: true,
});

initializeGenAIClient();

const program = new Command();
const chatService = new ChatService();

program
  .name("llmops-cli")
  .description("CLI for interacting with LangGraph agents")
  .version("1.0.0");


program.addCommand(defaultAgentProgram);


program
  .command("research-agent <message>")
  .description("Interact with the Research agent")
  .option("-m, --model [model]", "Model to use", "gemini-2.5-flash")
  .option("-p, --project [project]", "Project to use")
  .option("-l, --location [location]", "Location to use")
  .action(
    async (
      message: string,
      options: { model: string; project: string; location: string },
    ) => {
      console.log(`Sending message to Search Agent: \"${message}\"`);
      const { project, location, model } = options; // Destructure model
      const response = await chatService.processMessage(
        message,
        [],
        "research",
        { project, location },
        model, // Pass model
      );
      console.log("Search Agent Response:", response);
    },
  );

program
  .command("secure-agent <message>")
  .description("Interact with the Secure agent")
  .option("-m, --model [model]", "Model to use", "gemini-2.5-flash")
  .option("-p, --project [project]", "Project to use")
  .option("-l, --location [location]", "Location to use")
  .action(
    async (
      message: string,
      options: { model: string; project: string; location: string },
    ) => {
      console.log(`Sending message to Secure Agent: \"${message}\"`);
      const { project, location, model } = options;
      const response = await chatService.processMessage(
        message,
        [],
        "secure",
        { project, location },
        model,
      );
      console.log("Secure Agent Response:", response);
    },
  );

program.parse(process.argv);
