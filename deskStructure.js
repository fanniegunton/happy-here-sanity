// deskStructure.js
export default (S) =>
  S.list()
    .title("Content")
    .items([
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
          !["settings", "venueSubmission", "blockedSender"].includes(
            listItem.getId()
          )
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
