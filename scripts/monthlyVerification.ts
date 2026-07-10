/**
 * scripts/monthlyVerification.ts
 *
 * Monthly bulk verification pass. Run by the happy-here-update.yml GitHub
 * Actions workflow (dispatched from the Studio dashboard's "Run Monthly
 * Check" button), or locally:
 *
 *   BROWSERBASE_API_KEY=... SANITY_API_TOKEN=... pnpm exec tsx scripts/monthlyVerification.ts
 *
 * For each published establishment with a website, runs a Stagehand/
 * Browserbase check and writes any changes as Sanity *drafts* (same merge
 * logic as applyChanges.ts) so they land in Studio for review — nothing is
 * auto-published.
 *
 * Never patches experience fields: seating, lighting, goodForConversation,
 * staffNiceness, music, bathrooms, interiorDesign, accessibility,
 * allergyFriendly. Notes are only ever appended to (AUTO-FLAG lines), never
 * overwritten.
 *
 * Environment variables:
 *   BROWSERBASE_API_KEY — required
 *   SANITY_API_TOKEN    — required unless DRY_RUN=true (needs read+write)
 *   MODE                — currently only "verify" (default)
 *   DRY_RUN             — "true" to log without writing drafts
 *
 * Writes a summary to output/monthly-verification-<date>.json (uploaded as
 * a workflow artifact in CI).
 */

import { Stagehand } from "@browserbasehq/stagehand"
import { createClient } from "@sanity/client"
import { z } from "zod"
import { createSpinner } from "nanospinner"
import chalk from "chalk"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const MODE = process.env.MODE || "verify"
const DRY_RUN = process.env.DRY_RUN === "true"
const OUTPUT_DIR = join(__dirname, "..", "output")

// Experience fields — never patched by automation (notes handled separately:
// append-only AUTO-FLAG lines).
const EXPERIENCE_FIELDS = [
  "seating", "lighting", "goodForConversation", "staffNiceness",
  "music", "bathrooms", "interiorDesign", "accessibility",
  "allergyFriendly", "notes",
]

const VerificationSchema = z.object({
  isOperational: z.boolean(),
  permanentlyClosed: z.boolean(),
  temporarilyClosed: z.boolean(),
  websiteAlive: z.boolean(),
  happyHourStillExists: z.boolean().optional(),
  happyHourTimes: z.array(z.string()).optional(),
  happyHourSummary: z.string().optional(),
  hoursChanged: z.boolean().optional(),
  currentHours: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

type Verification = z.infer<typeof VerificationSchema>

const EXTRACT_INSTRUCTION = `Check this establishment's website for the following:
  1. Is the business operational (not closed)?
  2. Is it permanently or temporarily closed?
  3. Does a happy hour, drink special, or similar deal still exist?
  4. What are the happy hour times if listed (e.g. "Mon–Fri 3–6pm")?
  5. A brief summary of what the happy hour includes (drinks, food, pricing).
  6. What are the current business hours if listed?
  Look for happy hour info on the homepage, a menu page, or a specials/deals page.`

interface Establishment {
  _id: string
  name: string
  website: string
  happyHourDetails?: string
  notes?: string
}

interface RecordResult {
  _id: string
  name: string
  website: string
  status: "ok" | "needsReview" | "closed" | "error"
  reason?: string
  draftWritten: boolean
  changes?: string[]
}

const sanity = createClient({
  projectId: "9h94j7zr",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function verifyOne(website: string): Promise<Verification> {
  const stagehand = new Stagehand({ env: "BROWSERBASE", verbose: 0 })
  await stagehand.init()
  try {
    const page =
      stagehand.context.pages()[0] ?? (await stagehand.context.newPage())
    await page.goto(website, { waitUntil: "networkidle", timeoutMs: 20000 })
    return await stagehand.extract(EXTRACT_INSTRUCTION, VerificationSchema)
  } finally {
    await stagehand.close().catch(() => {})
  }
}

/**
 * Build the draft patch for one establishment from its verification result.
 * Returns null when nothing needs to change.
 */
function buildPatch(
  doc: Establishment,
  result: Verification
): Record<string, unknown> | null {
  const today = new Date().toISOString().split("T")[0]
  const patchData: Record<string, unknown> = {}
  const flagNotes: string[] = []

  if (result.happyHourTimes?.length) {
    patchData.happyHourTimes = result.happyHourTimes
  }
  // Only fill happyHourDetails if currently empty — never overwrite prose
  if (result.happyHourSummary && !doc.happyHourDetails) {
    patchData.happyHourDetails = result.happyHourSummary
  }
  if (result.currentHours?.length) {
    patchData.hours = result.currentHours
  }
  if (result.permanentlyClosed) {
    patchData.needsReview = true
    flagNotes.push(
      `[AUTO-FLAG ${today}] Possibly permanently closed — verify before removing.`
    )
  } else if (result.happyHourStillExists === false) {
    patchData.needsReview = true
    flagNotes.push(
      `[AUTO-FLAG ${today}] Happy hour not found on website — verify.`
    )
  }

  // Guard: extraction output must never touch experience fields
  EXPERIENCE_FIELDS.forEach((f) => delete patchData[f])

  // Flag notes are append-only, added after the guard on purpose
  if (flagNotes.length) {
    patchData.notes = [doc.notes, ...flagNotes].filter(Boolean).join("\n\n")
  }

  return Object.keys(patchData).length > 0 ? patchData : null
}

/** Write changes as a draft, merging onto the published doc (applyChanges pattern). */
async function writeDraft(
  baseId: string,
  patchData: Record<string, unknown>
): Promise<void> {
  const published = await sanity.getDocument(baseId)
  if (!published) throw new Error("published doc not found")

  const { _rev, ...base } = published
  const draft = { ...base, ...patchData, _id: `drafts.${baseId}` }
  await sanity.createOrReplace(draft)
}

async function main() {
  if (MODE !== "verify") {
    console.log(chalk.yellow(`Unknown mode "${MODE}" — nothing to do.`))
    return
  }
  if (!process.env.BROWSERBASE_API_KEY) {
    throw new Error("BROWSERBASE_API_KEY is not set")
  }
  if (!DRY_RUN && !process.env.SANITY_API_TOKEN) {
    throw new Error("SANITY_API_TOKEN is not set (or set DRY_RUN=true)")
  }

  const establishments: Establishment[] = await sanity.fetch(
    `*[_type == "establishment" && defined(website) && !(_id in path("drafts.**"))]
      | order(name asc) { _id, name, website, happyHourDetails, notes }`
  )

  console.log(
    chalk.bold(
      `\nVerifying ${establishments.length} establishment(s)${DRY_RUN ? chalk.yellow(" (dry run)") : ""}...\n`
    )
  )

  const results: RecordResult[] = []

  for (const doc of establishments) {
    const spinner = createSpinner(chalk.dim(doc.name)).start()

    try {
      const verification = await verifyOne(doc.website)
      const patchData = buildPatch(doc, verification)

      const status: RecordResult["status"] = verification.permanentlyClosed
        ? "closed"
        : verification.happyHourStillExists === false
          ? "needsReview"
          : "ok"

      let draftWritten = false
      if (patchData && !DRY_RUN) {
        await writeDraft(doc._id, patchData)
        draftWritten = true
      }

      results.push({
        _id: doc._id,
        name: doc.name,
        website: doc.website,
        status,
        draftWritten,
        changes: patchData ? Object.keys(patchData) : undefined,
      })

      const suffix = patchData
        ? DRY_RUN
          ? chalk.yellow(`would update: ${Object.keys(patchData).join(", ")}`)
          : chalk.green(`draft written: ${Object.keys(patchData).join(", ")}`)
        : chalk.dim("no changes")
      spinner.success({ text: `${doc.name} — ${status} — ${suffix}` })
    } catch (err: any) {
      // Errors (unreachable site, Browserbase hiccup) are recorded but do
      // NOT flag the document — transient failures shouldn't create review noise
      results.push({
        _id: doc._id,
        name: doc.name,
        website: doc.website,
        status: "error",
        reason: err.message || "unknown error",
        draftWritten: false,
      })
      spinner.error({ text: `${doc.name} — ${chalk.red(err.message || "unknown error")}` })
    }
  }

  const summary = {
    ranAt: new Date().toISOString(),
    mode: MODE,
    dryRun: DRY_RUN,
    total: results.length,
    ok: results.filter((r) => r.status === "ok").length,
    needsReview: results.filter((r) => r.status === "needsReview").length,
    closed: results.filter((r) => r.status === "closed").length,
    errors: results.filter((r) => r.status === "error").length,
    draftsWritten: results.filter((r) => r.draftWritten).length,
    results,
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  const outFile = join(
    OUTPUT_DIR,
    `monthly-verification-${summary.ranAt.split("T")[0]}.json`
  )
  await writeFile(outFile, JSON.stringify(summary, null, 2))

  console.log(
    `\n${chalk.green.bold(`${summary.ok} OK`)}, ${chalk.yellow.bold(`${summary.needsReview} need review`)}, ${chalk.red.bold(`${summary.closed} flagged closed`)}, ${summary.errors} error(s) — ${summary.draftsWritten} draft(s) written`
  )
  console.log(chalk.dim(`Summary: ${outFile}\n`))
  console.log(
    chalk.bold("Review and publish the drafts in Sanity Studio.")
  )
}

main().catch((err) => {
  console.error(chalk.red(err))
  process.exit(1)
})
