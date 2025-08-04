import { Command } from "commander";
import { ChatService } from "./services/chat-service";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const program = new Command();
const chatService = new ChatService();

program
  .name("llmops-cli")
  .description("CLI for interacting with LangGraph agents")
  .version("1.0.0");

program
  .command("default-agent <message>")
  .description("Interact with the Default agent")
  .option("-m, --model [model]", "Model to use", "gemini-2.0-flash")
  .option("-p, --project [project]", "Project to use")
  .option("-l, --location [location]", "Location to use")
  .action(
    async (
      message: string,
      options: { model: string; project: string; location: string },
    ) => {
      console.log(`Sending message to Default Agent: \"${message}\"`);
      const { project, location, model } = options; // Destructure model
      const response = await chatService.processMessage(
        message,
        [],
        "default",
        { project, location },
        model, // Pass model
      );
      console.log("Default Agent Response:", response);
    },
  );

program
  .command("search-agent <message>")
  .description("Interact with the Search agent")
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
        "search",
        { project, location },
        model, // Pass model
      );
      console.log("Search Agent Response:", response);
    },
  );

program.parse(process.argv);
