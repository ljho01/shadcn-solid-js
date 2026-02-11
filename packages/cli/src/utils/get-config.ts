import path from "path"
import { cosmiconfig } from "cosmiconfig"
import { z } from "zod"

export const configSchema = z.object({
  $schema: z.string().optional(),
  style: z.string().default("default"),
  tailwind: z.object({
    config: z.string(),
    css: z.string(),
    baseColor: z.string().optional(),
    cssVariables: z.boolean().default(true),
  }),
  solidjs: z.object({
    componentsPath: z.string(),
    utilsPath: z.string(),
  }),
  aliases: z.object({
    components: z.string(),
    utils: z.string(),
  }),
})

export type Config = z.infer<typeof configSchema>

const explorer = cosmiconfig("components", {
  searchPlaces: [
    "components.json",
    ".componentsrc",
    ".componentsrc.json",
  ],
})

export async function getConfig(cwd: string): Promise<Config | null> {
  try {
    const configResult = await explorer.search(cwd)

    if (!configResult) {
      return null
    }

    return configSchema.parse(configResult.config)
  } catch (error) {
    return null
  }
}

export async function resolveConfigPaths(cwd: string, config: Config) {
  return {
    ...config,
    resolvedPaths: {
      tailwindConfig: path.resolve(cwd, config.tailwind.config),
      tailwindCss: path.resolve(cwd, config.tailwind.css),
      components: path.resolve(cwd, config.solidjs.componentsPath),
      utils: path.resolve(cwd, config.solidjs.utilsPath),
    },
  }
}
