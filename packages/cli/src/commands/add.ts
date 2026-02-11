import { existsSync, promises as fs } from "fs"
import path from "path"
import { Command } from "commander"
import ora from "ora"
import prompts from "prompts"
import { z } from "zod"
import { logger } from "../utils/logger"
import { getConfig, resolveConfigPaths } from "../utils/get-config"
import { fetchRegistry } from "../utils/registry"

const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  cwd: z.string(),
  overwrite: z.boolean(),
  yes: z.boolean(),
})

export const add = new Command()
  .name("add")
  .description("add a component to your project")
  .argument("[components...]", "the components to add")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-o, --overwrite", "overwrite existing files.", false)
  .option("-y, --yes", "skip confirmation prompt.", false)
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        cwd: path.resolve(opts.cwd),
        ...opts,
      })

      // Check if config exists
      const config = await getConfig(options.cwd)
      if (!config) {
        logger.error(
          "Configuration not found. Please run 'shadcn-solid init' first."
        )
        process.exit(1)
      }

      const resolvedConfig = await resolveConfigPaths(options.cwd, config)

      // If no components specified, prompt user
      let selectedComponents = options.components || []
      if (selectedComponents.length === 0) {
        const { component } = await prompts({
          type: "text",
          name: "component",
          message: "Which component would you like to add?",
        })

        if (!component) {
          logger.info("No component selected.")
          process.exit(0)
        }

        selectedComponents = [component]
      }

      // Fetch and install components
      for (const componentName of selectedComponents) {
        const spinner = ora(`Adding ${componentName}...`).start()

        try {
          const registryItem = await fetchRegistry(componentName)

          if (!registryItem) {
            spinner.fail(`Component "${componentName}" not found in registry.`)
            continue
          }

          // Install dependencies
          if (registryItem.dependencies && registryItem.dependencies.length > 0) {
            spinner.text = `Installing dependencies for ${componentName}...`
            // TODO: Install npm dependencies
          }

          // Write component files
          for (const file of registryItem.files) {
            // Use target path if available, otherwise use components path + file.path
            const targetPath = file.target
              ? path.resolve(options.cwd, file.target)
              : path.resolve(
                  resolvedConfig.resolvedPaths.components,
                  file.path
                )

            // Check if file exists
            if (existsSync(targetPath) && !options.overwrite && !options.yes) {
              spinner.stop()
              const { overwrite } = await prompts({
                type: "confirm",
                name: "overwrite",
                message: `File ${path.basename(targetPath)} already exists. Overwrite?`,
                initial: false,
              })

              if (!overwrite) {
                logger.info(`Skipped ${componentName}`)
                continue
              }
              spinner.start()
            }

            // Create directory if it doesn't exist
            await fs.mkdir(path.dirname(targetPath), { recursive: true })

            // Write file
            await fs.writeFile(targetPath, file.content, "utf-8")
          }

          spinner.succeed(`Added ${componentName}`)
        } catch (error) {
          spinner.fail(`Failed to add ${componentName}`)
          console.error(error)
        }
      }

      logger.break()
      logger.success("Done!")
    } catch (error) {
      logger.error("Failed to add components")
      console.error(error)
      process.exit(1)
    }
  })
