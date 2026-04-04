import { getCliClient } from "sanity/cli"
import { createSpinner } from "nanospinner"
import chalk from "chalk"
import { readdir, readFile, rename } from "node:fs/promises"
import { join } from "node:path"

const PENDING_DIR = join(__dirname, "..", "pendingChanges")

interface SanityDocument {
  _id: string
  _type: string
  _rev?: string
  [key: string]: unknown
}

async function main() {
  const client = getCliClient({ apiVersion: "2024-01-01" })

  // Read all JSON files from pendingChanges/
  let files: string[]
  try {
    files = (await readdir(PENDING_DIR)).filter((f) => f.endsWith(".json"))
  } catch {
    console.log(chalk.yellow("No pendingChanges/ directory found."))
    return
  }

  if (files.length === 0) {
    console.log(chalk.yellow("No .json files in pendingChanges/"))
    return
  }

  console.log(
    chalk.bold(`\nApplying ${files.length} pending change(s)...\n`)
  )

  let applied = 0
  let skipped = 0

  for (const file of files) {
    const filePath = join(PENDING_DIR, file)
    const raw = await readFile(filePath, "utf-8")
    const doc: SanityDocument = JSON.parse(raw)

    const baseId = doc._id.replace(/^drafts\./, "")
    const draftId = `drafts.${baseId}`
    const label = doc._type ? `${doc._type} ${baseId}` : baseId
    const spinner = createSpinner(chalk.dim(label)).start()

    try {
      // Fetch the published document to use as the base
      const published = await client.getDocument(baseId)
      if (!published) {
        spinner.warn({ text: `${label} — ${chalk.yellow("published doc not found, skipping")}` })
        skipped++
        continue
      }

      // Merge: start from published, overlay with the pending changes
      const { _id, _rev, ...changes } = doc
      const draft: SanityDocument = {
        ...published,
        ...changes,
        _id: draftId,
      }
      delete draft._rev

      await client.createOrReplace(draft)

      // Move the file to pendingChanges/applied/
      const appliedDir = join(PENDING_DIR, "applied")
      await readdir(appliedDir).catch(() =>
        import("node:fs").then((fs) =>
          fs.mkdirSync(appliedDir, { recursive: true })
        )
      )
      await rename(filePath, join(appliedDir, file))

      spinner.success({ text: `${label} — ${chalk.green("draft created")}` })
      applied++
    } catch (err: any) {
      spinner.error({
        text: `${label} — ${chalk.red(err.message || "unknown error")}`,
      })
      skipped++
    }
  }

  console.log(
    `\n${chalk.green.bold(`${applied} applied`)}${skipped ? chalk.yellow(`, ${skipped} skipped`) : ""}\n`
  )
}

main().catch((err) => {
  console.error(chalk.red(err))
  process.exit(1)
})
