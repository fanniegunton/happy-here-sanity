import { createImageField } from "sanity-pills";

export default {
  title: "Establishment",
  name: "establishment",
  type: "document",
  fieldsets: [
    {
      title: "General Information",
      name: "information",
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
    {
      title: "Happy Hour",
      name: "happyHour",
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
    {
      title: "Ownership Details",
      name: "ownershipDetails",
      options: {
        collapsible: true,
        collapsed: true,
      },
    },
    {
      title: "Experience",
      name: "experience",
      options: {
        collapsible: true,
        collapsed: true,
      },
    },
  ],
  fields: [
    {
      title: "HH Verified!",
      name: "unverified",
      type: "boolean",
      initialValue: false,
    },
    {
      title: "Name",
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
      fieldset: "information",
    },
    {
      title: "Website",
      name: "website",
      type: "url",
      fieldset: "information",
    },
    {
      title: "Instagram",
      name: "instagram",
      type: "url",
      fieldset: "information",
    },
    {
      title: "Hours",
      name: "hours",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "information",
    },
    {
      title: "Address",
      name: "address",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
      fieldset: "information",
    },
    {
      title: "Neighborhood",
      name: "neighborhood",
      type: "string",
      validation: (Rule) => Rule.required(),
      fieldset: "information",
    },
    {
      title: "Photo",
      name: "photo",
      description: "Photo of the establishment or the happy hour fare",
      ...createImageField({
        validations: { minWidth: 600, minHeight: 300 },
        options: {
          accept: "image/jpg, image/jpeg, image/png",
          hotspot: true,
        },
      }),
    },
    {
      title: "Happy Hour Times",
      name: "happyHourTimes",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "happyHour",
    },
    {
      title: "Happy Hour Menu",
      name: "happyHourMenu",
      type: "url",
      fieldset: "happyHour",
    },
    {
      title: "Happy Hour Details",
      name: "happyHourDetails",
      type: "text",
      validation: (Rule) => Rule.required(),
      fieldset: "happyHour",
      rows: 3,
    },
    {
      title: "What We Have Here",
      name: "whatWeHaveHere",
      description: "Leave blank if unknown.",
      fieldset: "happyHour",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Beer", value: "beer" },
          { title: "Wine", value: "wine" },
          { title: "Cocktails", value: "cocktails" },
          { title: "NA Drinks", value: "naDrinks" },
          { title: "Coffee", value: "coffee" },
          { title: "Food", value: "food" },
          { title: "Merchandise", value: "merch" },
        ],
      },
    },
    {
      title: "The Space Is Like",
      name: "theSpaceIsLike",
      description: "Leave blank if unknown.",
      fieldset: "happyHour",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Indoor", value: "indoor" },
          { title: "Patio", value: "patio" },
          { title: "Bar Seating", value: "barSeating" },
          { title: "Dog Friendly", value: "dogFriendly" },
          { title: "Small Groups Only (up to 4)", value: "smallGroups" },
          { title: "Bigger Groups Possible (more than 4)", value: "bigGroups" },
          {
            title: "Reservations Recommended/Required",
            value: "reservationsRec",
          },
          {
            title: "Staff Pick",
            value: "staffPick",
          },
        ],
      },
    },
    {
      title: "Ownership Identified As:",
      name: "ownershipIdentifiedAs",
      description: "Leave blank if unknown.",
      fieldset: "ownershipDetails",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Black-Owned", value: "blackOwned" },
          { title: "Latino-Owned", value: "latinoOwned" },
          { title: "LGBTQA+ Owned", value: "lgbtqaplusOwned" },
          { title: "Women-Owned", value: "womenOwned" },
          { title: "Native-Owned", value: "nativeOwned" },
          { title: "AAPI-Owned", value: "aapiOwned" },
          { title: "BIPOC-Owned", value: "bipocOwned" },
        ],
      },
    },
    {
      title: "Key People",
      name: "keyPeople",
      description:
        "Who are the key people at this establishment? Owners, chefs, food or bev program managers matter. Investors are potentially interesting. Leave blank if unknown.",
      fieldset: "ownershipDetails",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      title: "Local or not?",
      name: "localOrNot",
      description:
        "Is this establishment actually local to Austin or is it part of a larger chain? Leave blank if unknown.",
      fieldset: "ownershipDetails",
      type: "boolean",
    },
    {
      title: "Ownership Group",
      name: "ownershipGroup",
      description:
        "Is this establishment part of a larger group? Leave blank if unknown.",
      fieldset: "ownershipDetails",
      type: "string",
    },
    {
      title: "Quick Description",
      name: "quickDescription",
      description:
        "Sum up in a phrase of few words. Leave blank if you're drawing a blank.",
      fieldset: "experience",
      type: "string",
    },
    {
      title: "Seating",
      name: "seating",
      description:
        "Describe the tables and seating in as much detail as possible.",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Lighting",
      name: "lighting",
      description:
        "Describe the lighting in as much detail as possible. `Soul-sucking` or `sexy AF` both count as valid.",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Good for Conversation",
      name: "goodForConversation",
      description: "Describe the noise level and general vibe.",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Staff Niceness",
      name: "staffNiceness",
      description:
        "Are the staff nice? Are they attentive? Do they give good suggestions when asked?",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Music",
      name: "music",
      description:
        "What's the music like? Style, volume, live or playlists–what's it like?",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Bathrooms",
      name: "bathrooms",
      description:
        "Are they clean? All-gender? Do you want to take a cute photo in it?",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Interior Design",
      name: "interiorDesign",
      description:
        "What's the interior design like? Is it cool? What style is being conjured? Does it feel like an era or other establishments or a certain designer? Does it feel DIY or expensive? Does it have soul?",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Accessibility",
      name: "accessibility",
      description:
        "Is it accessible? What's the seating like? Are there stairs?",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Allergy Friendly",
      name: "allergyFriendly",
      description:
        "Do they have allergy-friendly options? How do they handle allergies? Are they open to correcting some, but not others? Are they knowledgeable about allergens (e.g. do they think eggs are dairy)?",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Notes",
      name: "notes",
      description: "Anything else you want to add?",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
  ],
};
