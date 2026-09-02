// deskStructure.js
export default (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Neighborhoods")
        .schemaType("neighborhoodProfile")
        .child(
          S.documentTypeList("neighborhoodProfile").title("Neighborhoods")
        ),
      S.listItem()
        .title("Settings")
        .child(
          S.editor()
            .id("settings")
            .schemaType("settings")
            .documentId("settings")
        ),
      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            "settings",
            "venueSubmission",
            "blockedSender",
            "post",
            "category",
            "author",
            "journalSettings",
            "neighborhoodProfile",
            "list",
          ].includes(listItem.getId())
      ),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) =>
        ["post", "category", "author", "list"].includes(listItem.getId())
      ),
      S.listItem()
        .title("Journal Settings")
        .child(
          S.editor()
            .id("journalSettings")
            .schemaType("journalSettings")
            .documentId("journalSettings")
        ),
      S.divider(),
      S.listItem()
        .title("Archived Submissions")
        .child(
          S.documentTypeList("venueSubmission")
            .title("Archived Submissions")
            .filter(
              '_type == "venueSubmission" && !(_id in path("drafts.**"))'
            )
        ),
      S.listItem()
        .title("Venue Submissions")
        .child(
          S.documentTypeList("venueSubmission").title("Venue Submissions")
        ),
      S.listItem()
        .title("Blocked Sender")
        .child(
          S.documentTypeList("blockedSender").title("Blocked Sender")
        ),
    ]);
