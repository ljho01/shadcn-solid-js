import { existsSync, promises as fs } from "fs"
import path from "path"
import { Command } from "commander"
import prompts from "prompts"
import { z } from "zod"
import { logger } from "../utils/logger"
import { type Config } from "../utils/get-config"

const initOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean(),
})

export const init = new Command()
  .name("init")
  .description("initialize your project and install dependencies")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-y, --yes", "skip confirmation prompt.", false)
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        ...opts,
      })

      logger.info("Initializing shadcn-solid in your project...")
      logger.break()

      // Check if components.json already exists
      const configPath = path.resolve(options.cwd, "components.json")
      if (existsSync(configPath) && !options.yes) {
        const { overwrite } = await prompts({
          type: "confirm",
          name: "overwrite",
          message:
            "components.json already exists. Would you like to overwrite it?",
          initial: false,
        })

        if (!overwrite) {
          logger.info("Initialization cancelled.")
          process.exit(0)
        }
      }

      // Prompt for configuration
      const answers = options.yes
        ? {
            style: "default",
            tailwindConfig: "tailwind.config.ts",
            tailwindCss: "src/styles/app.css",
            cssVariables: true,
            componentsPath: "~/components",
            utilsPath: "~/lib/utils",
          }
        : await prompts([
            {
              type: "select",
              name: "style",
              message: "Which style would you like to use?",
              choices: [
                { title: "Default", value: "default" },
                { title: "New York", value: "new-york" },
              ],
              initial: 0,
            },
        {
          type: "text",
          name: "tailwindConfig",
          message: "Where is your tailwind.config located?",
          initial: "tailwind.config.ts",
        },
        {
          type: "text",
          name: "tailwindCss",
          message: "Where is your global CSS file?",
          initial: "src/styles/app.css",
        },
        {
          type: "confirm",
          name: "cssVariables",
          message: "Would you like to use CSS variables for theming?",
          initial: true,
        },
        {
          type: "text",
          name: "componentsPath",
          message: "Configure the import alias for components:",
          initial: "~/components",
        },
        {
          type: "text",
          name: "utilsPath",
          message: "Configure the import alias for utils:",
          initial: "~/lib/utils",
        },
      ])

      if (!options.yes && !answers) {
        logger.info("Initialization cancelled.")
        process.exit(0)
      }

      // Create config
      const config: Config = {
        $schema: "https://shadcn-solid.com/schema.json",
        style: answers.style,
        tailwind: {
          config: answers.tailwindConfig,
          css: answers.tailwindCss,
          cssVariables: answers.cssVariables,
        },
        solidjs: {
          componentsPath: answers.componentsPath.replace("~/", "src/"),
          utilsPath: answers.utilsPath.replace("~/", "src/"),
        },
        aliases: {
          components: answers.componentsPath,
          utils: answers.utilsPath,
        },
      }

      // Write config file
      await fs.writeFile(
        configPath,
        JSON.stringify(config, null, 2),
        "utf-8"
      )

      logger.success("Created components.json")
      logger.break()
      logger.info("You can now add components using:")
      logger.info("  npx shadcn-solid add button")
      logger.break()
    } catch (error) {
      logger.error("Failed to initialize project")
      console.error(error)
      process.exit(1)
    }
  })
