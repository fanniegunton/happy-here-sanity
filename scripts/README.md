# Scripts

Utility scripts run via the Sanity CLI. All scripts in this directory use `sanity exec`, which provides access to the Sanity client and project configuration.

```sh
sanity exec scripts/<name>.ts --with-user-token
```

## `applyChanges.ts`

Reads JSON files from `pendingChanges/` and creates Sanity draft documents so changes can be reviewed in the Studio before publishing.

### How to use

1. **Create a JSON file** in `pendingChanges/` with the document ID, type, and fields to change:

   ```json
   {
     "_id": "abc123",
     "_type": "establishment",
     "happyHourTimes": ["Mon-Fri: 4PM-6PM"]
   }
   ```

   Name the file something descriptive — e.g. `easy-tiger.json`.

2. **Run the script:**

   ```sh
   sanity exec scripts/applyChanges.ts --with-user-token
   ```

3. **Review in Sanity Studio.** Each document will appear as a draft with pending changes.

4. **Publish** (or discard) in the Studio as usual.

### How it works

- Fetches the published version of each document by `_id`
- Shallow-merges your changes on top
- Writes the result as `drafts.<_id>` via `createOrReplace`
- Moves applied files to `pendingChanges/applied/`

### Notes

- Use the **base document ID** (not `drafts.*`) in your JSON files
- Only include fields you're changing — everything else carries over from the published version
- If no published document exists for an ID, the file is skipped with a warning
- The `pendingChanges/` directory is gitignored; treat it as a working area
