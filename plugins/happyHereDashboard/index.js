/**
 * plugins/happyHereDashboard/index.js
 *
 * Registers the Happy Here dashboard as a Sanity Studio plugin.
 * Import and add to the `plugins` array in sanity.config.js.
 */

import { definePlugin } from "sanity";
import { HappyHereDashboardWidget } from "./DashboardWidget";

export const happyHereDashboard = definePlugin({
  name: "happy-here-dashboard",
  studio: {
    components: {
      // Replaces the default Studio home screen with our dashboard.
      // If you want it alongside the default layout instead, use a
      // custom tool (see sanity.config.snippet.js for the tool version).
      navbar: undefined, // leave default navbar
    },
  },
  // Register as a custom tool (tab in the sidebar)
  tools: (prev) => [
    ...prev,
    {
      name: "happy-here-dashboard",
      title: "Dashboard",
      icon: () => "🍹",
      component: HappyHereDashboardWidget,
    },
  ],
});
