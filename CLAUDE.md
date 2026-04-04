# Happy Here — Sanity Studio

Content studio for Happy Here, an Austin happy hour directory.

## Project setup

- **Package manager:** pnpm
- **Sanity project ID:** `9h94j7zr`
- **Dataset:** `production`
- **CLI:** Use `sanity` directly (not `npx sanity`)

## Scripts

Scripts live in `scripts/` and are run via `sanity exec`:

```sh
sanity exec scripts/<name>.ts --with-user-token
```

The `--with-user-token` flag is required for any script that reads or writes documents.

### `scripts/applyChanges.ts`

Applies bulk document changes as Sanity drafts so they can be reviewed and published in the Studio.

**Workflow:**

1. Create one JSON file per document in `pendingChanges/`. Each file needs at minimum `_id` and `_type`, plus whichever fields you want to change:

   ```json
   {
     "_id": "abc123",
     "_type": "establishment",
     "happyHourTimes": ["Mon-Fri: 4PM-6PM"]
   }
   ```

2. Run the script:

   ```sh
   sanity exec scripts/applyChanges.ts --with-user-token
   ```

3. The script fetches the current published version of each document, merges in the changes, and writes a `drafts.*` version. Successfully applied files are moved to `pendingChanges/applied/`.

4. Review and publish the drafts in Sanity Studio.

**Details:**
- The `_id` in the JSON should be the base document ID (without `drafts.` prefix) — the script handles the draft ID automatically.
- Changes are a shallow merge onto the published document, so you only need to include the fields being changed.
- If a published document doesn't exist for a given `_id`, the change is skipped.
- Files are named descriptively (e.g. `easy-tiger.json`) for easy identification.

## Data exports

Export the production dataset for local processing:

```sh
sanity datasets export production exports/production.ndjson --no-assets
```

The `--no-assets` flag skips downloading images/files, which speeds things up when you only need documents. The output file is a gzipped tarball despite the `.ndjson` name.

To extract and read the documents:

```sh
cd exports
tar xzf production.ndjson
```

This produces a directory like `production-export-<timestamp>/` containing:
- `data.ndjson` — one JSON document per line (the actual content)
- `assets.json`, `images/`, `files/` — asset metadata (empty when exported with `--no-assets`)

The `exports/` directory is gitignored. Re-export whenever you need fresh data.

## Content model

Documentation lives in `docs/content-model/`:

- [Hours formatting](docs/content-model/hours-formatting.md) — format spec for `happyHourTimes` and `hours` fields

When writing or modifying `happyHourTimes` or `hours` values, always read the hours formatting doc first.
