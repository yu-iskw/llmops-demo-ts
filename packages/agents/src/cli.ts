import { Command } from "commander";
import dotenv from "dotenv";
import { getProjectRootPath } from "./utils/utilities";
import path from "path";
// Sub commands
import { defaultAgentProgram } from "./agents/default_agent/cli";
import { researchAgentProgram } from "./agents/research_agent/cli";
import { secureAgentProgram } from "./agents/secure_agent/cli";

// Load environment variables from the root of the package
dotenv.config({
  path: path.resolve(getProjectRootPath(), ".env"),
  debug: true,
});

const program = new Command();

program
  .name("llmops-demo-ts")
  .description("CLI for interacting with the LLMOps Demo application")
  .version("1.0.0");

program.addCommand(defaultAgentProgram);
program.addCommand(researchAgentProgram);
program.addCommand(secureAgentProgram);

program.parse(process.argv);
