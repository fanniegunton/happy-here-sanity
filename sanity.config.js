// sanity.config.js
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import schemas from "./schemas/schema";
import deskStructure from "./deskStructure";

export default defineConfig({
  title: "Happy Here",
  projectId: "9h94j7zr",
  dataset: "production",
  plugins: [
    structureTool({
      structure: deskStructure,
    }),
    visionTool(),
  ],
  schema: {
    types: schemas,
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter(
          (templateItem) => templateItem.templateId != "settings",
        );
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      // Remove certain actions from settings
      if (schemaType === "settings") {
        return prev.filter(
          ({ action }) =>
            !["unpublish", "delete", "duplicate"].includes(action),
        );
      }

      return prev;
    },
  },
});
