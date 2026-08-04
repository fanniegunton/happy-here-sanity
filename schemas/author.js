import { createImageField } from "sanity-pills";

export default {
  title: "Author",
  name: "author",
  type: "document",
  fields: [
    {
      title: "Author Name",
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Author Url",
      name: "url",
      type: "url",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Author Avatar",
      name: "avatar",
      ...createImageField({
        validations: {
          required: true,
          minWidth: 200,
          minHeight: 200,
        },
      }),
    },
  ],
};
