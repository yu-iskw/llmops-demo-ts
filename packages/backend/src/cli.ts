import { Command } from "commander";
import dotenv from "dotenv";
import { getProjectRootPath } from "./utils/utils";
import path from "path";
import { getGenAI } from "./utils/genai";
// Sub commands
import { defaultAgentProgram } from "./agents/default_agent/cli";
import { researchAgentProgram } from "./agents/research_agent/cli";
import { secureAgentProgram } from "./agents/secure_agent/cli";

// Load environment variables from the root of the package
dotenv.config({
  path: path.resolve(getProjectRootPath(), ".env"),
  debug: true,
});

// Initialize the GoogleGenAI client
getGenAI();

const program = new Command();

program
  .name("llmops-cli")
  .description("CLI for interacting with LangGraph agents")
  .version("1.0.0");
// Add sub commands
program.addCommand(defaultAgentProgram);
program.addCommand(researchAgentProgram);
program.addCommand(secureAgentProgram);
// Parse the command line arguments
program.parse(process.argv);
