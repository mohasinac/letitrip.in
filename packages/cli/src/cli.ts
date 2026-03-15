#!/usr/bin/env node
/**
 * @mohasinac/cli — binary entry point
 *
 * Usage:
 *   npx @mohasinac/cli add <feature>
 *   npx @mohasinac/cli remove <feature>
 *   npx @mohasinac/cli list
 */

import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { removeCommand } from "./commands/remove.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program
  .name("mohasinac")
  .description("@mohasinac/* feature library CLI")
  .version("0.1.0");

program.addCommand(addCommand());
program.addCommand(removeCommand());
program.addCommand(listCommand());

program.parse(process.argv);
