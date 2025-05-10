import { createImageField } from "sanity-pills";

export default {
  title: "Placeholder Images",
  name: "placeholderImages",
  type: "document",
  fields: [
    {
      title: "Name",
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Image",
      name: "image",
      type: "image",
      options: {
        accept: "image/*",
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
  ],
};
