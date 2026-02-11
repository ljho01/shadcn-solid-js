#!/usr/bin/env bun
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
const packagesDir = path.join(rootDir, "packages", "shadcn")
const outputDir = path.join(rootDir, "apps", "docs", "public", "r")

interface RegistryItem {
  name: string
  type: "registry:ui" | "registry:lib" | "registry:hook"
  files: Array<{
    path: string
    content: string
    type: "registry:ui" | "registry:lib" | "registry:hook"
    target?: string
  }>
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
}

async function getPackageDependencies(packagePath: string) {
  try {
    const packageJsonPath = path.join(packagePath, "package.json")
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"))
    
    const dependencies: string[] = []
    const devDependencies: string[] = []
    const registryDependencies: string[] = []

    // Extract dependencies
    if (packageJson.dependencies) {
      for (const [dep, version] of Object.entries(packageJson.dependencies)) {
        if (dep.startsWith("@shadcn-solid-js/")) {
          // Registry dependency (other shadcn-solid components)
          const depName = dep.replace("@shadcn-solid-js/", "")
          if (depName !== "utils") {
            registryDependencies.push(depName)
          }
        } else if (dep.startsWith("@radix-solid-js/")) {
          // Radix dependency
          dependencies.push(`${dep}@${version}`)
        } else if (!dep.startsWith("workspace:")) {
          // External dependency
          dependencies.push(`${dep}@${version}`)
        }
      }
    }

    if (packageJson.devDependencies) {
      for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
        if (!dep.startsWith("@") && !dep.startsWith("workspace:")) {
          devDependencies.push(`${dep}@${version}`)
        }
      }
    }

    return { dependencies, devDependencies, registryDependencies }
  } catch (error) {
    console.error(`Failed to read package.json for ${packagePath}:`, error)
    return { dependencies: [], devDependencies: [], registryDependencies: [] }
  }
}

async function getComponentFiles(componentPath: string, componentName: string) {
  const srcDir = path.join(componentPath, "src")
  const files: RegistryItem["files"] = []

  try {
    const entries = await fs.readdir(srcDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
        // Skip test files
        if (entry.name.endsWith(".test.tsx") || entry.name.endsWith(".test.ts")) {
          continue
        }

        const filePath = path.join(srcDir, entry.name)
        let content = await fs.readFile(filePath, "utf-8")

        // Transform imports to use local aliases
        content = transformImports(content)

        files.push({
          path: entry.name,
          content,
          type: "registry:ui",
          target: `components/ui/${entry.name}`,
        })
      }
    }
  } catch (error) {
    console.error(`Failed to read component files for ${componentName}:`, error)
  }

  return files
}

function transformImports(content: string): string {
  // Transform @shadcn-solid-js/utils to @/lib/utils
  content = content.replace(
    /from ["']@shadcn-solid\/utils["']/g,
    'from "~/lib/utils"'
  )

  // Transform @radix-solid-js/* to keep as is (will be installed as dependency)
  // No transformation needed for @radix-solid

  return content
}

async function buildRegistry() {
  console.log("🔨 Building registry...")

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true })

  // Get all component directories
  const componentDirs = await fs.readdir(packagesDir, { withFileTypes: true })
  const components: string[] = []
  const registry: Record<string, RegistryItem> = {}

  for (const dir of componentDirs) {
    if (!dir.isDirectory()) continue

    const componentName = dir.name
    const componentPath = path.join(packagesDir, componentName)

    // Skip utils package (it's handled separately)
    if (componentName === "utils") {
      continue
    }

    console.log(`  Processing ${componentName}...`)

    // Get component files
    const files = await getComponentFiles(componentPath, componentName)

    if (files.length === 0) {
      console.warn(`    ⚠️  No files found for ${componentName}`)
      continue
    }

    // Get dependencies
    const { dependencies, devDependencies, registryDependencies } =
      await getPackageDependencies(componentPath)

    // Create registry item
    const registryItem: RegistryItem = {
      name: componentName,
      type: "registry:ui",
      files,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
      devDependencies: devDependencies.length > 0 ? devDependencies : undefined,
      registryDependencies:
        registryDependencies.length > 0 ? registryDependencies : undefined,
    }

    registry[componentName] = registryItem
    components.push(componentName)

    // Write individual component registry file
    const outputPath = path.join(outputDir, `${componentName}.json`)
    await fs.writeFile(outputPath, JSON.stringify(registryItem, null, 2), "utf-8")
    console.log(`    ✅ Created ${componentName}.json`)
  }

  // Write index file
  const indexPath = path.join(outputDir, "index.json")
  await fs.writeFile(indexPath, JSON.stringify(components.sort(), null, 2), "utf-8")
  console.log(`\n✅ Created index.json with ${components.length} components`)

  console.log("\n✨ Registry build complete!")
  console.log(`📦 Output directory: ${outputDir}`)
}

// Run the builder
buildRegistry().catch((error) => {
  console.error("❌ Failed to build registry:", error)
  process.exit(1)
})
