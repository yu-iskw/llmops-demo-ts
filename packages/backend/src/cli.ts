import { Command } from "commander";
import { ChatService } from "./services/chat-service";
import dotenv from "dotenv";

dotenv.config();

const program = new Command();
const chatService = new ChatService();

program
  .name("llmops-cli")
  .description("CLI for interacting with LangGraph agents")
  .version("1.0.0");

program
  .command("financial-advisor <message>")
  .description("Interact with the Financial Advisor agent")
  .action(async (message: string) => {
    console.log(`Sending message to Financial Advisor: \"${message}\"`);
    const response = await chatService.processMessage(
      message,
      [],
      "financial-advisor",
    );
    console.log("Financial Advisor Response:", response);
  });

program
  .command("trip-planner <message>")
  .description("Interact with the Trip Planner agent")
  .action(async (message: string) => {
    console.log(`Sending message to Trip Planner: \"${message}\"`);
    const response = await chatService.processMessage(
      message,
      [],
      "trip-planner",
    );
    console.log("Trip Planner Response:", response);
  });

program.parse(process.argv);
