import { z } from "zod"

export const registryItemFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  type: z.enum(["registry:ui", "registry:lib", "registry:hook"]),
  target: z.string().optional(),
})

export const registryItemSchema = z.object({
  name: z.string(),
  type: z.enum(["registry:ui", "registry:lib", "registry:hook"]),
  files: z.array(registryItemFileSchema),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
})

export type RegistryItem = z.infer<typeof registryItemSchema>

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:3000/r"

export async function fetchRegistry(name: string): Promise<RegistryItem | null> {
  try {
    const response = await fetch(`${REGISTRY_URL}/${name}.json`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return registryItemSchema.parse(data)
  } catch (error) {
    console.error(`Failed to fetch registry item: ${name}`, error)
    return null
  }
}

export async function fetchRegistryIndex(): Promise<string[]> {
  try {
    const response = await fetch(`${REGISTRY_URL}/index.json`)
    
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return z.array(z.string()).parse(data)
  } catch (error) {
    console.error("Failed to fetch registry index", error)
    return []
  }
}
