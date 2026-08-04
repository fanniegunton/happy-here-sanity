/**
 * plugins/happyHereDashboard/DashboardWidget.jsx
 *
 * Happy Here Studio dashboard widget. Renders:
 *   1. Run Monthly Check button with red/green status indicator
 *      - Goes red on the 1st of each month (resets automatically)
 *      - Goes green after you click it; stays green until next 1st
 *   2. Google Places pre-flight: batch-checks all records with no website
 *      for "permanently closed" status before Browserbase sessions fire
 *   3. Deploy Site: triggers a Netlify rebuild so published edits go live
 *   4. Flagged/closed establishments list with links to their Studio records
 *
 * Drop this file into your Sanity Studio and register via the plugin index.
 */

import { useState, useEffect, useCallback } from "react";
import { useClient } from "sanity";
import { Card, Stack, Text, Button, Badge, Spinner, Box, Flex, Heading } from "@sanity/ui";
import { CheckmarkCircleIcon, WarningOutlineIcon, ClockIcon, LaunchIcon } from "@sanity/icons";
import { REGIONS, allSubNeighborhoods } from "../../schemas/objects/neighborhood";

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const MONTHLY_CHECK_ENDPOINT =
  process.env.SANITY_STUDIO_MONTHLY_CHECK_ENDPOINT ||
  "https://happyhere.netlify.app/.netlify/functions/run-monthly-check";

const PLACES_PREFLIGHT_ENDPOINT =
  process.env.SANITY_STUDIO_PLACES_PREFLIGHT_ENDPOINT ||
  "https://happyhere.netlify.app/.netlify/functions/places-preflight";

// Netlify build hook for the public site. Anyone holding this ID can trigger a
// build, so it stays out of the repo — set it in .env.local and in whatever
// environment builds the Studio (SANITY_STUDIO_* vars are inlined at build
// time, so a missing value here means the button renders but can't fire).
const NETLIFY_BUILD_HOOK_ID = process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID;
const NETLIFY_SITE_URL = "https://hh.takeouttracker.com";
const NETLIFY_ADMIN_URL = "https://app.netlify.com/projects/happyhere/deploys";

// localStorage key for tracking last run date
const LAST_RUN_KEY = "happyhere_monthly_check_last_run";

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function getLastRunDate() {
  try {
    const stored = localStorage.getItem(LAST_RUN_KEY);
    return stored ? new Date(stored) : null;
  } catch {
    return null;
  }
}

function setLastRunDate(date) {
  try {
    localStorage.setItem(LAST_RUN_KEY, date.toISOString());
  } catch {}
}

/**
 * POSTs to a Netlify function and returns its parsed JSON body.
 *
 * Netlify doesn't always answer with JSON: a function that exceeds the 10s
 * limit comes back as a plain-text timeout notice, and gateway failures come
 * back as HTML. Calling res.json() on those throws "Failed to execute 'json'
 * on 'Response'", which tells you nothing about what actually went wrong — so
 * read the body as text first and surface a message naming the real cause.
 */
async function postJson(endpoint, body) {
  const res = await fetch(endpoint, {
    method: "POST",
    ...(body && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    const detail = text.trim().slice(0, 200);
    throw new Error(
      detail
        ? `Endpoint returned ${res.status}: ${detail}`
        : `Endpoint returned ${res.status}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    const detail = text.trim().slice(0, 200);
    throw new Error(
      detail
        ? `Expected JSON, got: ${detail}`
        : "Endpoint returned an empty response"
    );
  }
}

/**
 * Returns true if the monthly check needs to be run.
 * Red if: never run, OR last run was before the 1st of the current month.
 */
function checkNeedsRun() {
  const lastRun = getLastRunDate();
  if (!lastRun) return true;

  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return lastRun < firstOfThisMonth;
}

// ---------------------------------------------------------------------------
// RUN MONTHLY CHECK BUTTON
// ---------------------------------------------------------------------------

function MonthlyCheckButton() {
  const [needsRun, setNeedsRun] = useState(checkNeedsRun);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [preflightRunning, setPreflightRunning] = useState(false);
  const [preflightResult, setPreflightResult] = useState(null);

  const lastRun = getLastRunDate();

  const handlePreflight = useCallback(async () => {
    setPreflightRunning(true);
    setPreflightResult(null);
    try {
      setPreflightResult(await postJson(PLACES_PREFLIGHT_ENDPOINT));
    } catch (err) {
      setPreflightResult({ error: err.message });
    } finally {
      setPreflightRunning(false);
    }
  }, []);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setRunResult(null);

    try {
      setRunResult(await postJson(MONTHLY_CHECK_ENDPOINT, { mode: "verify" }));

      const now = new Date();
      setLastRunDate(now);
      setNeedsRun(false);
    } catch (err) {
      setRunResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  }, []);

  const statusTone = needsRun ? "critical" : "positive";
  const StatusIcon = needsRun ? WarningOutlineIcon : CheckmarkCircleIcon;

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={3}>
        <Flex align="center" gap={3}>
          <Heading size={1}>Monthly Check</Heading>
          <Badge
            tone={statusTone}
            padding={2}
            radius={2}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <StatusIcon style={{ marginRight: 4 }} />
            {needsRun ? "Due" : "Done"}
          </Badge>
        </Flex>

        {lastRun && (
          <Text size={1} muted>
            <ClockIcon style={{ marginRight: 4, verticalAlign: "middle" }} />
            Last run: {lastRun.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        )}

        {!lastRun && (
          <Text size={1} muted>
            Never run — status resets red on the 1st of each month.
          </Text>
        )}

        {/* Step 1: Google Places pre-flight */}
        <Stack space={2}>
          <Text size={1} weight="semibold">
            Step 1 — Places pre-flight
          </Text>
          <Text size={1} muted>
            Flags closed records with no website via Google Places, before
            Browserbase runs.
          </Text>
          <Button
            text={preflightRunning ? "Checking Places…" : "Run Places Pre-flight"}
            tone="primary"
            mode="ghost"
            icon={preflightRunning ? Spinner : undefined}
            disabled={preflightRunning}
            onClick={handlePreflight}
          />
          {preflightResult && !preflightResult.error && (
            <Card padding={2} tone="positive" radius={2}>
              <Stack space={2}>
                <Text size={1}>
                  ✓ {preflightResult.checked} checked —{" "}
                  {preflightResult.flaggedClosed} flagged closed,{" "}
                  {preflightResult.skippedHasWebsite} skipped (have website).
                </Text>
                {preflightResult.errors?.length > 0 && (
                  <Text size={1} muted>
                    {preflightResult.errors.length} couldn't be looked up:{" "}
                    {preflightResult.errors
                      .map((e) => `${e.name} (${e.reason})`)
                      .join(", ")}
                  </Text>
                )}
              </Stack>
            </Card>
          )}
          {preflightResult?.error && (
            <Card padding={2} tone="critical" radius={2}>
              <Text size={1}>Pre-flight error: {preflightResult.error}</Text>
            </Card>
          )}
        </Stack>

        {/* Step 2: Full monthly check */}
        <Stack space={2}>
          <Text size={1} weight="semibold">
            Step 2 — Full verification pass
          </Text>
          <Text size={1} muted>
            Runs Browserbase on records with websites. Updates HH times and
            hours; flags anything off.
          </Text>
          <Button
            text={isRunning ? "Running…" : "Run Monthly Check"}
            tone={needsRun ? "critical" : "default"}
            disabled={isRunning}
            onClick={handleRun}
          />
        </Stack>

        {runResult && !runResult.error && (
          <Card padding={2} tone="positive" radius={2}>
            <Text size={1}>
              ✓ Complete — {runResult.ok ?? "?"} OK,{" "}
              {runResult.needsReview ?? "?"} need review,{" "}
              {runResult.closed ?? "?"} flagged closed.
              {" "}Check your output files or the list below.
            </Text>
          </Card>
        )}
        {runResult?.error && (
          <Card padding={2} tone="critical" radius={2}>
            <Text size={1}>Error: {runResult.error}</Text>
          </Card>
        )}
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// DEPLOY SITE BUTTON
// ---------------------------------------------------------------------------

/**
 * Triggers a Netlify rebuild of the public site via build hook, so published
 * data edits go live immediately instead of waiting for a scheduled build.
 *
 * The hook returns 200 with an empty body and no deploy ID, so we can only
 * report that the build was *queued* — not that it succeeded. The Netlify
 * link is there for actually watching it land.
 */
function DeployButton() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [result, setResult] = useState(null);

  const handleDeploy = useCallback(async () => {
    setIsDeploying(true);
    setResult(null);
    try {
      // Build hooks allow cross-origin POST (access-control-allow-origin: *),
      // so a plain fetch works and the status is readable.
      const res = await fetch(
        `https://api.netlify.com/build_hooks/${NETLIFY_BUILD_HOOK_ID}`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(`Netlify returned ${res.status}`);
      setResult({ queuedAt: new Date() });
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setIsDeploying(false);
    }
  }, []);

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={3}>
        <Heading size={1}>Deploy Site</Heading>

        <Text size={1} muted>
          Rebuilds the public site so published changes go live now.
        </Text>

        {NETLIFY_BUILD_HOOK_ID ? (
          <Button
            text={isDeploying ? "Triggering…" : "Deploy Site"}
            tone="primary"
            icon={isDeploying ? Spinner : undefined}
            disabled={isDeploying}
            onClick={handleDeploy}
          />
        ) : (
          <Card padding={2} tone="caution" radius={2}>
            <Text size={1}>
              SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID is not set — add it to
              .env.local and restart the Studio.
            </Text>
          </Card>
        )}

        {result?.queuedAt && (
          <Card padding={2} tone="positive" radius={2}>
            <Text size={1}>
              ✓ Build queued at{" "}
              {result.queuedAt.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
              . Usually live in a few minutes.
            </Text>
          </Card>
        )}
        {result?.error && (
          <Card padding={2} tone="critical" radius={2}>
            <Text size={1}>Deploy error: {result.error}</Text>
          </Card>
        )}

        <Flex gap={3}>
          <Text size={1}>
            <a
              href={NETLIFY_ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Deploy log <LaunchIcon style={{ verticalAlign: "middle" }} />
            </a>
          </Text>
          <Text size={1}>
            <a href={NETLIFY_SITE_URL} target="_blank" rel="noopener noreferrer">
              View site <LaunchIcon style={{ verticalAlign: "middle" }} />
            </a>
          </Text>
        </Flex>
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// FLAGGED ESTABLISHMENTS LIST
// ---------------------------------------------------------------------------

const FLAGGED_QUERY = `
  *[_type == "establishment" && (needsReview == true || unverified == false)] 
  | order(name asc) {
    _id,
    name,
    neighborhood,
    needsReview,
    unverified,
    notes,
    website
  }
`;

// `neighborhood` is an object ({ region, subNeighborhood* }) — resolve it to
// the human-readable titles defined in the schema before rendering
function formatNeighborhood(neighborhood) {
  if (!neighborhood) return null;
  const regionLabel = REGIONS.find((r) => r.value === neighborhood.region)?.title;
  const subValue = Object.entries(neighborhood).find(
    ([key, value]) => key.startsWith("subNeighborhood") && value
  )?.[1];
  const subLabel = allSubNeighborhoods.find((s) => s.value === subValue)?.title;
  if (regionLabel && subLabel) return `${regionLabel} — ${subLabel}`;
  return regionLabel || subLabel || null;
}

function FlaggedList() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .fetch(FLAGGED_QUERY)
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [client]);

  if (loading) {
    return (
      <Card padding={4}>
        <Flex align="center" gap={2}>
          <Spinner />
          <Text size={1} muted>Loading flagged records…</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding={4} tone="critical">
        <Text size={1}>Could not load flagged records: {error}</Text>
      </Card>
    );
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        <Flex align="center" justify="space-between">
          <Heading size={1}>Needs Attention</Heading>
          {records.length > 0 && (
            <Badge tone="critical" padding={2} radius={2}>
              {records.length}
            </Badge>
          )}
        </Flex>

        {records.length === 0 ? (
          <Card padding={2} tone="positive" radius={2}>
            <Text size={1}>All clear — nothing flagged right now.</Text>
          </Card>
        ) : (
          <Stack space={2}>
            {records.map((record) => (
              <Card
                key={record._id}
                padding={3}
                radius={2}
                tone={record.needsReview ? "caution" : "default"}
                style={{ borderLeft: "3px solid var(--card-border-color)" }}
              >
                <Flex align="center" justify="space-between">
                  <Stack space={1} style={{ flex: 1 }}>
                    <Flex align="center" gap={2}>
                      <Text size={2} weight="semibold">
                        {record.name}
                      </Text>
                      {record.needsReview && (
                        <Badge tone="caution" padding={1} fontSize={0}>
                          Flagged
                        </Badge>
                      )}
                      {record.unverified === false && (
                        <Badge tone="default" padding={1} fontSize={0}>
                          Unverified
                        </Badge>
                      )}
                    </Flex>
                    {formatNeighborhood(record.neighborhood) && (
                      <Text size={1} muted>
                        {formatNeighborhood(record.neighborhood)}
                      </Text>
                    )}
                    {record.notes?.includes("[AUTO-FLAG") && (
                      <Text size={1} muted style={{ fontStyle: "italic" }}>
                        {record.notes
                          .split("\n")
                          .find((l) => l.includes("[AUTO-FLAG"))
                          ?.replace(/^\[AUTO-FLAG [^\]]+\] /, "")}
                      </Text>
                    )}
                  </Stack>
                  <Button
                    as="a"
                    href={`/structure/establishment;${record._id}`}
                    text="Open"
                    mode="ghost"
                    tone="primary"
                    icon={LaunchIcon}
                    fontSize={1}
                    padding={2}
                  />
                </Flex>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// MAIN WIDGET EXPORT
// ---------------------------------------------------------------------------

export function HappyHereDashboardWidget() {
  return (
    <Box padding={4}>
      <Stack space={4}>
        {/* Side by side on wide screens; wraps to stacked when the Studio
            pane gets narrow, since each card needs ~320px to stay readable. */}
        <Flex gap={4} wrap="wrap" align="flex-start">
          <Box flex={1} style={{ minWidth: 320 }}>
            <MonthlyCheckButton />
          </Box>
          <Box flex={1} style={{ minWidth: 320 }}>
            <DeployButton />
          </Box>
        </Flex>
        <FlaggedList />
      </Stack>
    </Box>
  );
}
