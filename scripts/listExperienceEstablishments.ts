import { getCliClient } from "sanity/cli"
import chalk from "chalk"

const EXPERIENCE_FIELDS = [
  "quickDescription",
  "seating",
  "lighting",
  "goodForConversation",
  "staffNiceness",
  "music",
  "bathrooms",
  "interiorDesign",
  "accessibility",
  "allergyFriendly",
  "notes",
]

async function main() {
  const client = getCliClient({ apiVersion: "2024-01-01" })

  const hasExperienceInfo = EXPERIENCE_FIELDS.map((field) => `defined(${field})`).join(" || ")
  const query = `*[_type == "establishment" && (${hasExperienceInfo})] | order(name asc){ name }`

  const establishments: { name: string }[] = await client.fetch(query)

  console.log(chalk.bold(`${establishments.length} establishments with experience info:\n`))
  for (const { name } of establishments) {
    console.log(`- ${name}`)
  }
}

main().catch((err) => {
  console.error(chalk.red(err))
  process.exit(1)
})
