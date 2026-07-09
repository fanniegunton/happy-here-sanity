export const DEFAULT_IMPLEMENTATION_NOTE = "Establishment record updated.";

export const CHANNEL_OPTIONS = [
  { title: "SMS", value: "sms" },
  { title: "MMS", value: "mms" },
];

export default {
  title: "Venue Submission",
  name: "venueSubmission",
  type: "document",
  fields: [
    {
      title: "Channel",
      name: "channel",
      type: "string",
      options: {
        list: CHANNEL_OPTIONS,
      },
    },
    {
      title: "From",
      name: "fromIdentifier",
      description: "Phone number or Telegram user id/username",
      type: "string",
    },
    {
      title: "Received At",
      name: "receivedAt",
      type: "datetime",
    },
    {
      title: "Raw Text",
      name: "rawText",
      description: "The message as received. May be empty if photo-only.",
      type: "text",
      rows: 3,
    },
    {
      title: "Media",
      name: "media",
      type: "array",
      of: [{ type: "image" }],
    },
    {
      title: "Extraction",
      name: "extraction",
      type: "object",
      fields: [
        {
          title: "Venue Name Guess",
          name: "venueNameGuess",
          type: "string",
        },
        {
          title: "Matched Venue",
          name: "matchedVenue",
          type: "reference",
          to: [{ type: "establishment" }],
          weak: true,
        },
        {
          title: "Looks Like a New Venue",
          name: "isNewVenueGuess",
          type: "boolean",
        },
        {
          title: "Neighborhood Guess",
          name: "neighborhoodGuess",
          type: "string",
        },
        {
          title: "Specials Guess",
          name: "specialsGuess",
          description:
            "Same shape as Happy Hour Details on Establishment — copy straight across on approval.",
          type: "text",
          rows: 3,
        },
        {
          title: "Confidence Score",
          name: "confidenceScore",
          description: "0–100",
          type: "number",
          validation: (Rule) => Rule.min(0).max(100),
        },
      ],
    },
    {
      title: "Duplicate Of",
      name: "duplicateOf",
      description:
        "Set by the intake pipeline when this looks like a repeat of a recent submission.",
      type: "reference",
      to: [{ type: "venueSubmission" }],
      weak: true,
    },
    {
      title: "Status",
      name: "status",
      type: "string",
      initialValue: "pending",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
    },
    {
      title: "Implementation Notes",
      name: "implementationNotes",
      description: `Studio-side notes on how this submission was handled. If left blank, set to "${DEFAULT_IMPLEMENTATION_NOTE}" when archived.`,
      type: "text",
      rows: 3,
    },
  ],
  preview: {
    select: {
      venueNameGuess: "extraction.venueNameGuess",
      channel: "channel",
      confidenceScore: "extraction.confidenceScore",
      duplicateOf: "duplicateOf",
      media: "media.0",
      status: "status",
    },
    prepare({
      venueNameGuess,
      channel,
      confidenceScore,
      duplicateOf,
      media,
      status,
    }) {
      const channelLabel =
        CHANNEL_OPTIONS.find((c) => c.value === channel)?.title ?? channel;
      const confidenceLabel =
        typeof confidenceScore === "number"
          ? `${confidenceScore}% confidence`
          : "no confidence score";
      return {
        title: `${duplicateOf ? "🔁 " : ""}${venueNameGuess || "Unknown venue"}`,
        subtitle: [channelLabel, confidenceLabel, status]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
};
