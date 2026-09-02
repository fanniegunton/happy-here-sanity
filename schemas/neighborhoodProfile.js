import { createImageField } from "sanity-pills";
import { SubNeighborhoodInput } from "../components/SubNeighborhoodInput";
import { REGIONS, allSubNeighborhoods } from "./objects/neighborhood";

const COLOR_SCHEME_OPTIONS = ["Scheme1", "Scheme2", "Scheme3"];

export default {
  title: "Neighborhood Profile",
  name: "neighborhoodProfile",
  type: "document",
  fields: [
    {
      title: "Region",
      name: "region",
      type: "string",
      validation: (Rule) => Rule.required(),
      options: {
        layout: "dropdown",
        list: REGIONS,
      },
    },
    {
      title: "Sub-neighborhood",
      name: "subNeighborhood",
      type: "string",
      validation: (Rule) => Rule.required(),
      components: {
        input: SubNeighborhoodInput,
      },
    },
    {
      title: "Quick Description",
      name: "quickDescription",
      type: "text",
      rows: 3,
    },
    {
      title: "Photos",
      name: "photos",
      type: "array",
      of: [
        createImageField({
          options: {
            accept: "image/jpg, image/jpeg, image/png",
            hotspot: true,
          },
        }),
      ],
    },
    {
      title: "Main Copy",
      name: "mainCopy",
      type: "blockContent",
    },
    {
      title: "Color Scheme",
      name: "colorScheme",
      type: "string",
      options: {
        layout: "dropdown",
        list: COLOR_SCHEME_OPTIONS,
      },
    },
  ],
  validation: (Rule) =>
    Rule.custom(async (doc, context) => {
      const { region, subNeighborhood, _id } = doc || {};
      if (!region || !subNeighborhood) return true;

      const baseId = (_id || "").replace(/^drafts\./, "");
      const { getClient } = context;
      const client = getClient({ apiVersion: "2024-01-01" });

      const duplicate = await client.fetch(
        `count(*[_type == "neighborhoodProfile" && region == $region && subNeighborhood == $subNeighborhood && !(_id in [$id, $draftId])])`,
        {
          region,
          subNeighborhood,
          id: baseId,
          draftId: `drafts.${baseId}`,
        }
      );

      if (duplicate > 0) {
        return "Another Neighborhood Profile already exists for this region and sub-neighborhood.";
      }

      return true;
    }),
  preview: {
    select: {
      region: "region",
      subNeighborhood: "subNeighborhood",
    },
    prepare({ region, subNeighborhood }) {
      const regionLabel = REGIONS.find((r) => r.value === region)?.title;
      const subLabel = allSubNeighborhoods.find(
        (s) => s.value === subNeighborhood
      )?.title;
      return {
        title: subLabel || "Untitled Neighborhood Profile",
        subtitle: regionLabel,
      };
    },
  },
};
