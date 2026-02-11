import { Command } from "commander"
import { logger } from "../utils/logger"
import { fetchRegistryIndex } from "../utils/registry"

export const list = new Command()
  .name("list")
  .description("list all available components")
  .action(async () => {
    try {
      logger.info("Fetching available components...")
      logger.break()

      const components = await fetchRegistryIndex()

      if (components.length === 0) {
        logger.warn("No components found in registry.")
        return
      }

      logger.success(`Found ${components.length} components:\n`)
      
      components.forEach((component) => {
        console.log(`  - ${component}`)
      })

      logger.break()
      logger.info("Add a component using:")
      logger.info("  npx shadcn-solid add <component-name>")
    } catch (error) {
      logger.error("Failed to fetch component list")
      console.error(error)
      process.exit(1)
    }
  })
