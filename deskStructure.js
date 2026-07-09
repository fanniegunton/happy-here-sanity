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
      S.listItem()
        .title("Archived Submissions")
        .child(
          S.documentTypeList("venueSubmission")
            .title("Archived Submissions")
            .filter(
              '_type == "venueSubmission" && !(_id in path("drafts.**"))'
            )
        ),
      ...S.documentTypeListItems().filter(
        (listItem) => !["settings"].includes(listItem.getId())
      ),
    ]);
