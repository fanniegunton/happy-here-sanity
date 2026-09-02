const listItem = {
  title: "List Item",
  name: "listItem",
  type: "object",
  fields: [
    {
      title: "Establishment",
      name: "establishment",
      type: "reference",
      to: [{ type: "establishment" }],
      options: {
        filter: ({ document }) => {
          const ids = (document.establishments || [])
            .map(e => (e.establishment ? e.establishment._ref : e._ref))
            .filter(x => x && x.length)

          return ids.length
            ? {
                filter: "!(_id in $ids)",
                params: { ids },
              }
            : {}
        },
      },
      validation: Rule => Rule.required(),
    },
    {
      title: "Copy",
      name: "copy",
      type: "text",
    },
  ],
  preview: {
    select: {
      title: "establishment.name",
      subtitle: "copy",
    },
  },
}

export default listItem
