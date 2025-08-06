import "module-alias/register";
import { Command } from "commander";
import { ChatService } from "../../services/chatService";

const defaultAgentProgram = new Command();
const chatService = new ChatService();

defaultAgentProgram
  .name("default-agent")
  .description("CLI for interacting with the Default Agent")
  .version("1.0.0");


defaultAgentProgram
  .command("run <message>")
  .description("Run the Default agent")
  .option("-m, --model [model]", "Model to use", "gemini-2.5-flash")
  .option("-p, --project [project]", "Project to use")
  .option("-l, --location [location]", "Location to use")
  .action(
    async (
      message: string,
      options: { model: string; project: string; location: string },
    ) => {
      console.log(`Sending message to Default Agent: \"${message}\"`);
      const { project, location, model } = options;

      const response = await chatService.processMessage(
        message,
        [],
        "default",
        { project, location },
        model,
        undefined, // sessionId
      );
      console.log("Default Agent Response:", response);
    },
  );

export { defaultAgentProgram }
