import hero from "./objects/hero"
import { createSlugField } from "./fields/slug"

const buildEstablishmentFilter = ({ document }) => {
  const ids = (document.establishments || [])
    .map(e => (e.establishment ? e.establishment._ref : e._ref))
    .filter(x => x && x.length)

  return ids.length
    ? {
        filter: "!(_id in $ids)",
        params: { ids },
      }
    : {}
}

const list = {
  title: "List",
  name: "list",
  type: "document",
  fieldsets: [
    {
      title: "Hero",
      name: "hero",
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
    {
      title: "Author",
      name: "author",
      options: {
        collapsible: true,
        collapsed: true,
      },
    },
  ],
  fields: [
    {
      title: "Name",
      name: "name",
      type: "string",
      validation: Rule => Rule.required().max(50),
    },

    createSlugField({ prefix: "lists", source: "name" }),

    {
      title: "Author",
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      fieldset: "author",
    },

    ...hero.fields
      .filter(({ name }) => name !== "title")
      .map(field => ({
        ...field,
        fieldset: "hero",
      })),

    {
      title: "Establishments",
      name: "establishments",
      type: "array",
      of: [
        { type: "listItem" },
        {
          type: "reference",
          to: [{ type: "establishment" }],
          options: {
            filter: buildEstablishmentFilter,
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      media: "background",
    },
  },
}

export default list
