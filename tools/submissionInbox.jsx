import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Flex,
  Spinner,
  Stack,
  Switch,
  Text,
  useToast,
} from "@sanity/ui";
import { InboxIcon, CheckmarkCircleIcon } from "@sanity/icons";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import {
  CHANNEL_OPTIONS,
  DEFAULT_IMPLEMENTATION_NOTE,
} from "../schemas/venueSubmission";

const API_VERSION = "2024-01-01";

// Pending submissions only ever exist as drafts (no auto-publish path),
// so query with the raw perspective to see them.
const PENDING_QUERY = `*[_type == "venueSubmission" && status == "pending" && _id in path("drafts.**")]{
  _id,
  channel,
  receivedAt,
  "venueNameGuess": extraction.venueNameGuess,
  "confidenceScore": extraction.confidenceScore,
  "isDuplicate": defined(duplicateOf),
  "thumbUrl": media[0].asset->url,
}`;

const COLUMNS = [
  { key: "venueNameGuess", label: "Venue Guess", flex: 3 },
  { key: "channel", label: "Channel", flex: 1 },
  { key: "confidenceScore", label: "Confidence", flex: 1 },
  { key: "receivedAt", label: "Received", flex: 2 },
];

function channelTitle(channel) {
  return CHANNEL_OPTIONS.find((c) => c.value === channel)?.title ?? channel;
}

function formatReceivedAt(receivedAt) {
  if (!receivedAt) return "—";
  return new Date(receivedAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function compareBy(column, direction) {
  return (a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    // Missing values sort to the bottom regardless of direction
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp =
      typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
    return direction === "asc" ? cmp : -cmp;
  };
}

function SubmissionInbox() {
  const client = useClient({ apiVersion: API_VERSION }).withConfig({
    perspective: "raw",
  });
  const router = useRouter();
  const toast = useToast();

  const [submissions, setSubmissions] = useState(null);
  const [sortColumn, setSortColumn] = useState("confidenceScore");
  const [sortDirection, setSortDirection] = useState("desc");
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [approving, setApproving] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    const results = await client.fetch(PENDING_QUERY);
    setSubmissions(results);
    setSelectedIds((prev) => {
      const stillPending = new Set(results.map((s) => s._id));
      return new Set([...prev].filter((id) => stillPending.has(id)));
    });
  }, [client]);

  useEffect(() => {
    fetchSubmissions().catch((err) => {
      toast.push({
        status: "error",
        title: "Failed to load submissions",
        description: err.message,
      });
    });
  }, [fetchSubmissions, toast]);

  const visibleRows = useMemo(() => {
    if (!submissions) return [];
    const filtered = duplicatesOnly
      ? submissions.filter((s) => s.isDuplicate)
      : submissions;
    return [...filtered].sort(compareBy(sortColumn, sortDirection));
  }, [submissions, duplicatesOnly, sortColumn, sortDirection]);

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((s) => selectedIds.has(s._id));

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(column === "confidenceScore" ? "desc" : "asc");
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds(
      allVisibleSelected ? new Set() : new Set(visibleRows.map((s) => s._id)),
    );
  };

  const openSubmission = (draftId) => {
    router.navigateIntent("edit", {
      id: draftId.replace(/^drafts\./, ""),
      type: "venueSubmission",
    });
  };

  const approveSelected = async () => {
    setApproving(true);
    let approved = 0;
    let failed = 0;
    for (const draftId of selectedIds) {
      try {
        const draftDoc = await client.getDocument(draftId);
        if (!draftDoc) {
          failed++;
          continue;
        }
        const { _rev, ...rest } = draftDoc;
        await client
          .transaction()
          .createOrReplace({
            ...rest,
            _id: draftId.replace(/^drafts\./, ""),
            status: "approved",
            implementationNotes: rest.implementationNotes?.trim()
              ? rest.implementationNotes
              : DEFAULT_IMPLEMENTATION_NOTE,
          })
          .delete(draftId)
          .commit();
        approved++;
      } catch (err) {
        console.error(`Failed to approve ${draftId}`, err);
        failed++;
      }
    }
    setApproving(false);
    toast.push({
      status: failed ? "warning" : "success",
      title: `${approved} approved & published${failed ? `, ${failed} failed` : ""}`,
    });
    await fetchSubmissions();
  };

  return (
    <Container width={3} paddingX={4} paddingY={5}>
      <Stack space={4}>
        <Flex align="center" justify="space-between">
          <Text size={3} weight="bold">
            Submission Inbox
          </Text>
          <Flex align="center" gap={4}>
            <Flex align="center" gap={2}>
              <Switch
                checked={duplicatesOnly}
                onChange={() => setDuplicatesOnly((v) => !v)}
              />
              <Text size={1}>Duplicates only</Text>
            </Flex>
            <Button
              icon={CheckmarkCircleIcon}
              text={`Approve & publish (${selectedIds.size})`}
              tone="positive"
              disabled={selectedIds.size === 0 || approving}
              loading={approving}
              onClick={approveSelected}
            />
          </Flex>
        </Flex>

        {submissions === null ? (
          <Flex justify="center" padding={6}>
            <Spinner muted />
          </Flex>
        ) : visibleRows.length === 0 ? (
          <Card padding={5} radius={2} tone="transparent" border>
            <Text align="center" muted>
              {duplicatesOnly
                ? "No pending submissions flagged as duplicates."
                : "No pending submissions. Inbox zero! 🎉"}
            </Text>
          </Card>
        ) : (
          <Card radius={2} border overflow="hidden">
            <Card padding={2} borderBottom tone="transparent">
              <Flex align="center" gap={2}>
                <Box style={{ width: 30 }}>
                  <Checkbox
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    aria-label="Select all visible"
                  />
                </Box>
                <Box style={{ width: 46 }} />
                {COLUMNS.map((col) => (
                  <Box key={col.key} flex={col.flex}>
                    <Button
                      mode="bleed"
                      padding={2}
                      onClick={() => handleSort(col.key)}
                      text={
                        sortColumn === col.key
                          ? `${col.label} ${sortDirection === "asc" ? "↑" : "↓"}`
                          : col.label
                      }
                    />
                  </Box>
                ))}
                <Box style={{ width: 80 }} />
              </Flex>
            </Card>

            <Stack>
              {visibleRows.map((submission) => (
                <Card
                  key={submission._id}
                  padding={2}
                  borderBottom
                  tone={selectedIds.has(submission._id) ? "primary" : "default"}
                  style={{ cursor: "pointer" }}
                  onClick={() => openSubmission(submission._id)}
                >
                  <Flex align="center" gap={2}>
                    <Box
                      style={{ width: 30 }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.has(submission._id)}
                        onChange={() => toggleRow(submission._id)}
                        aria-label={`Select ${submission.venueNameGuess || "submission"}`}
                      />
                    </Box>
                    <Box style={{ width: 46 }}>
                      {submission.thumbUrl ? (
                        <img
                          src={`${submission.thumbUrl}?w=80&h=80&fit=crop`}
                          alt=""
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 3,
                            display: "block",
                          }}
                        />
                      ) : null}
                    </Box>
                    <Box flex={3} paddingX={2}>
                      <Text size={1} weight="medium" textOverflow="ellipsis">
                        {submission.venueNameGuess || "Unknown venue"}
                      </Text>
                    </Box>
                    <Box flex={1} paddingX={2}>
                      <Text size={1} muted>
                        {channelTitle(submission.channel) || "—"}
                      </Text>
                    </Box>
                    <Box flex={1} paddingX={2}>
                      <Text size={1}>
                        {typeof submission.confidenceScore === "number"
                          ? submission.confidenceScore
                          : "—"}
                      </Text>
                    </Box>
                    <Box flex={2} paddingX={2}>
                      <Text size={1} muted>
                        {formatReceivedAt(submission.receivedAt)}
                      </Text>
                    </Box>
                    <Box style={{ width: 80 }}>
                      {submission.isDuplicate ? (
                        <Badge tone="caution">Duplicate</Badge>
                      ) : null}
                    </Box>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

export const submissionInboxTool = {
  name: "submission-inbox",
  title: "Submissions",
  icon: InboxIcon,
  component: SubmissionInbox,
};
