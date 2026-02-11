#!/usr/bin/env node
import { Command } from "commander"
import { add } from "./commands/add"
import { init } from "./commands/init"
import { list } from "./commands/list"

const packageJson = {
  name: "shadcn-solid",
  version: "0.1.0",
}

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

async function main() {
  const program = new Command()
    .name("shadcn-solid")
    .description("Add SolidJS components to your project")
    .version(
      packageJson.version || "0.1.0",
      "-v, --version",
      "display the version number"
    )

  program
    .addCommand(init)
    .addCommand(add)
    .addCommand(list)

  program.parse()
}

main()
