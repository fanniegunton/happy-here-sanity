// sanity.cli.js
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "9h94j7zr",
    dataset: "production",
  },
  deployment: {
    appId: 'd6854b3492df8425574ae1cf',
  },
});
