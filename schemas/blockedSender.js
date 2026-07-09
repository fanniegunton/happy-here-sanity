import { CHANNEL_OPTIONS } from "./venueSubmission";

export default {
  title: "Blocked Sender",
  name: "blockedSender",
  type: "document",
  fields: [
    {
      title: "Identifier",
      name: "identifier",
      description: "Phone number or Telegram id",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Channel",
      name: "channel",
      type: "string",
      options: {
        list: CHANNEL_OPTIONS,
      },
    },
    {
      title: "Reason",
      name: "reason",
      type: "string",
    },
    {
      title: "Active",
      name: "active",
      type: "boolean",
      initialValue: true,
    },
    {
      title: "Blocked At",
      name: "blockedAt",
      type: "datetime",
    },
  ],
  preview: {
    select: {
      identifier: "identifier",
      channel: "channel",
      active: "active",
    },
    prepare({ identifier, channel, active }) {
      const channelLabel =
        CHANNEL_OPTIONS.find((c) => c.value === channel)?.title ?? channel;
      return {
        title: identifier,
        subtitle: [channelLabel, active === false ? "inactive" : null]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
};
