/**
 * plugins/happyHereDashboard/DashboardWidget.jsx
 *
 * Happy Here Studio dashboard widget. Renders:
 *   1. Run Monthly Check button with red/green status indicator
 *      - Goes red on the 1st of each month (resets automatically)
 *      - Goes green after you click it; stays green until next 1st
 *   2. Google Places pre-flight: batch-checks all records with no website
 *      for "permanently closed" status before Browserbase sessions fire
 *   3. Flagged/closed establishments list with links to their Studio records
 *
 * Drop this file into your Sanity Studio and register via the plugin index.
 */

import { useState, useEffect, useCallback } from "react";
import { useClient } from "sanity";
import { Card, Stack, Text, Button, Badge, Spinner, Box, Flex, Heading } from "@sanity/ui";
import { CheckmarkCircleIcon, WarningOutlineIcon, ClockIcon, LaunchIcon } from "@sanity/icons";

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const MONTHLY_CHECK_ENDPOINT =
  process.env.SANITY_STUDIO_MONTHLY_CHECK_ENDPOINT ||
  "https://happyhere.netlify.app/.netlify/functions/run-monthly-check";

const PLACES_PREFLIGHT_ENDPOINT =
  process.env.SANITY_STUDIO_PLACES_PREFLIGHT_ENDPOINT ||
  "https://happyhere.netlify.app/.netlify/functions/places-preflight";

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
      const res = await fetch(PLACES_PREFLIGHT_ENDPOINT, { method: "POST" });
      const data = await res.json();
      setPreflightResult(data);
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
      const response = await fetch(MONTHLY_CHECK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "verify" }),
      });

      if (!response.ok) throw new Error(`Endpoint returned ${response.status}`);

      const data = await response.json();
      setRunResult(data);

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
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
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
            Batch-checks records with no website via Google Places API.
            Flags permanently closed ones before Browserbase sessions run,
            saving browser hours.
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
            <Card padding={3} tone="positive" radius={2}>
              <Text size={1}>
                ✓ {preflightResult.checked} checked —{" "}
                {preflightResult.flaggedClosed} flagged closed,{" "}
                {preflightResult.skippedHasWebsite} skipped (have website).
              </Text>
            </Card>
          )}
          {preflightResult?.error && (
            <Card padding={3} tone="critical" radius={2}>
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
            Runs Stagehand/Browserbase on all records with websites. Updates HH
            times and hours; flags anything that looks off.
          </Text>
          <Button
            text={isRunning ? "Running…" : "Run Monthly Check"}
            tone={needsRun ? "critical" : "default"}
            disabled={isRunning}
            onClick={handleRun}
          />
        </Stack>

        {runResult && !runResult.error && (
          <Card padding={3} tone="positive" radius={2}>
            <Text size={1}>
              ✓ Complete — {runResult.ok ?? "?"} OK,{" "}
              {runResult.needsReview ?? "?"} need review,{" "}
              {runResult.closed ?? "?"} flagged closed.
              {" "}Check your output files or the list below.
            </Text>
          </Card>
        )}
        {runResult?.error && (
          <Card padding={3} tone="critical" radius={2}>
            <Text size={1}>Error: {runResult.error}</Text>
          </Card>
        )}
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
          <Card padding={3} tone="positive" radius={2}>
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
                    {record.neighborhood && (
                      <Text size={1} muted>
                        {record.neighborhood}
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
      <Stack space={5}>
        <MonthlyCheckButton />
        <FlaggedList />
      </Stack>
    </Box>
  );
}
