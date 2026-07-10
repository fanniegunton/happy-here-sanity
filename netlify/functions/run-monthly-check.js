/**
 * netlify/functions/run-monthly-check.js
 *
 * Triggers the full monthly verification pass.
 * Called by the "Run Monthly Check" dashboard button.
 *
 * Rather than running Stagehand inline (which could timeout for large datasets),
 * this function triggers your GitHub Actions workflow via the GitHub API
 * and returns immediately. Results appear in your output/ files and in
 * the Sanity dataset after the workflow completes.
 *
 * Environment variables required:
 *   GITHUB_TOKEN          — Personal access token with `repo` + `workflow` scope
 *   GITHUB_OWNER          — Your GitHub username or org
 *   GITHUB_REPO           — The repo containing the pipeline
 *   GITHUB_WORKFLOW_ID    — The workflow file name: "happy-here-update.yml"
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_WORKFLOW_ID = process.env.GITHUB_WORKFLOW_ID || "happy-here-update.yml";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {}

  const mode = body.mode || "verify";

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "GitHub env vars not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO.",
      }),
    };
  }

  try {
    // Trigger workflow_dispatch event
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_ID}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            mode,
            dry_run: "false",
          },
        }),
      }
    );

    // GitHub returns 204 No Content on success
    if (response.status === 204) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggered: true,
          mode,
          message: `GitHub Actions workflow triggered (mode: ${mode}). Check the Actions tab for progress.`,
          actionsUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`,
        }),
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      statusCode: response.status,
      body: JSON.stringify({
        error: errorData.message || `GitHub API returned ${response.status}`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
