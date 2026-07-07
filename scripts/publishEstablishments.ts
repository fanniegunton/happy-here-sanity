import { getCliClient } from "sanity/cli"
import chalk from "chalk"

async function main() {
  const client = getCliClient({ apiVersion: "2024-01-01" })

  process.stdout.write("Fetching establishment drafts...\n")
  const drafts: { _id: string }[] = await client.fetch(
    `*[_type == "establishment" && _id in path("drafts.**")]{ _id }`
  )
  console.log(chalk.bold(`Found ${drafts.length} drafts to publish\n`))

  let published = 0
  let failed = 0

  for (const draft of drafts) {
    const baseId = draft._id.replace(/^drafts\./, "")
    try {
      const draftDoc = await client.getDocument(draft._id)
      if (!draftDoc) {
        console.log(chalk.yellow(`⚠ ${baseId} — draft not found, skipping`))
        failed++
        continue
      }

      const { _rev, ...rest } = draftDoc
      await client
        .transaction()
        .createOrReplace({ ...rest, _id: baseId })
        .delete(draft._id)
        .commit()

      console.log(chalk.green(`✔ ${baseId}`))
      published++
    } catch (err: any) {
      console.log(chalk.red(`✖ ${baseId} — ${err.message || "unknown error"}`))
      failed++
    }
  }

  console.log(
    `\n${chalk.green.bold(`${published} published`)}${failed ? chalk.yellow(`, ${failed} failed`) : ""}\n`
  )
}

main().catch((err) => {
  console.error(chalk.red(err))
  process.exit(1)
})
