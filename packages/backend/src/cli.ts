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
      const { project, location } = options;
      const response = await chatService.processMessage(
        message,
        [],
        "default",
        { project, location },
      );
      console.log("Default Agent Response:", response);
    },
  );

program.parse(process.argv);
