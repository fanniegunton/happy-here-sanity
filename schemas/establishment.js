import { createImageField } from "sanity-pills";

const ALLERGEN_OPTIONS = [
  { title: "Milk / Dairy", value: "milk" },
  { title: "Eggs", value: "eggs" },
  { title: "Fish", value: "fish" },
  { title: "Shellfish", value: "shellfish" },
  { title: "Tree Nuts", value: "tree_nuts" },
  { title: "Peanuts", value: "peanuts" },
  { title: "Wheat", value: "wheat" },
  { title: "Soy", value: "soy" },
  { title: "Sesame", value: "sesame" },
  { title: "Gluten", value: "gluten" },
];

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
      title: "Experience",
      name: "experience",
      options: {
        collapsible: true,
        collapsed: true,
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
      type: "neighborhood",
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
      title: "Quick Description",
      name: "quickDescription",
      description:
        "Sum up in a phrase of few words. Leave blank if you're drawing a blank.",
      fieldset: "experience",
      type: "string",
    },
    {
      title: "Vibe / Atmosphere",
      name: "vibeTags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Romantic", value: "romantic" },
          { title: "Cozy", value: "cozy" },
          { title: "Upscale", value: "upscale" },
          { title: "Casual", value: "casual" },
          { title: "Trendy", value: "trendy" },
          { title: "Dive-y", value: "divey" },
          { title: "Classy / Sophisticated", value: "classy" },
          { title: "Laid-back / Chill", value: "laidback" },
          { title: "Lively / Energetic", value: "lively" },
          { title: "Rustic", value: "rustic" },
          { title: "Industrial-chic", value: "industrial" },
          { title: "Speakeasy / Hidden-gem", value: "speakeasy" },
        ],
        layout: "grid",
      },
      fieldset: "experience",
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
      name: "seatingTypes",
      title: "Seating — Type",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Booths", value: "booths" },
          { title: "High-top / bar seating", value: "high_top" },
          { title: "Communal / shared tables", value: "communal" },
          { title: "Bar counter seating", value: "bar_counter" },
          { title: "Lounge / couch seating", value: "lounge" },
          { title: "Rooftop", value: "rooftop" },
          { title: "Standing-room only", value: "standing_room" },
        ],
        layout: "grid",
      },
      fieldset: "experience",
    },
    {
      name: "seatingDetails",
      title: "Seating — Details",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Reservable", value: "reservable" },
          { title: "Accommodates large groups", value: "large_groups" },
          {
            title: "Covered / weather-protected outdoor",
            value: "covered_outdoor",
          },
          { title: "Pet-friendly section", value: "pet_friendly" },
          { title: "Private / semi-private area", value: "private_area" },
          { title: "Waitlist system", value: "waitlist" },
        ],
        layout: "grid",
      },
      fieldset: "experience",
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
      name: "lightingTypes",
      title: "Lighting — Type",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Dim / moody", value: "dim_moody" },
          { title: "Bright / well-lit", value: "bright" },
          { title: "Natural light", value: "natural" },
          { title: "String / fairy lights", value: "string_lights" },
          { title: "Candlelit", value: "candlelit" },
          { title: "Neon / colorful accent", value: "neon" },
          { title: "Exposed bulb / industrial", value: "exposed_bulb" },
        ],
        layout: "grid",
      },
      fieldset: "experience",
    },
    {
      name: "lightingDetails",
      title: "Lighting — Details",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Photo-flattering", value: "photo_flattering" },
          { title: "Shifts through the day", value: "shifts_day_to_night" },
          {
            title: "Patio lighting weak after dark",
            value: "patio_dark_at_night",
          },
          { title: "Statement fixtures", value: "statement_fixtures" },
          { title: "TV / screen-heavy", value: "screen_heavy" },
        ],
        layout: "grid",
      },
      fieldset: "experience",
    },
    {
      title: "Good for Conversation",
      name: "goodForConversationLegacy",
      description: "Describe the noise level and general vibe.",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      name: "goodForConversation",
      title: "Good for Conversation",
      type: "string",
      options: {
        list: [
          { title: "1 — Too loud / hard to hear", value: "gfc_1" },
          { title: "2 — Noisy but manageable", value: "gfc_2" },
          { title: "3 — Moderate, some effort needed", value: "gfc_3" },
          { title: "4 — Pretty easy to talk", value: "gfc_4" },
          { title: "5 — Quiet and intimate", value: "gfc_5" },
        ],
      },
      fieldset: "experience",
    },
    {
      title: "Staff Warmth",
      name: "staffWarmth",
      description:
        "Are the staff nice? Are they attentive? Do they give good suggestions when asked?",
      fieldset: "experience",
      type: "string",
      options: {
        list: [
          { title: "1 — Bordering on rude", value: "1" },
          { title: "2 — Bare minimum", value: "2" },
          {
            title:
              "3 — Good at answering questions, but keeps it strictly on business",
            value: "3",
          },
          { title: "4 — They remember you, but they don't chat", value: "4" },
          { title: "5 — The CHEERS experience", value: "5" },
        ],
      },
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
      name: "bathroomDetails",
      title: "Bathrooms — Details",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Single-occupancy / private", value: "single_occupancy" },
          { title: "Gender-neutral", value: "gender_neutral" },
          {
            title: "Notably clean / well-maintained",
            value: "notably_clean",
          },
          {
            title: "Notably not well-maintained",
            value: "notably_unmaintained",
          },
          { title: "Long wait at peak hours", value: "long_wait" },
          {
            title: "Located outside main building",
            value: "separate_structure",
          },
          { title: "Distinctive design / decor", value: "distinctive_decor" },
        ],
        layout: "grid",
      },
      fieldset: "experience",
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
      title: "Designed By",
      name: "designedBy",
      description: "Who's the interior designer?",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      title: "Accessibility",
      name: "accessibility",
      description: "Write out details",
      fieldset: "experience",
      type: "text",
      rows: 3,
    },
    {
      name: "accessibilityIssues",
      title: "Accessibility — Issues to Be Aware Of",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          {
            title: "No ADA-compliant entrance (steps only, no ramp)",
            value: "no_ada_entrance",
          },
          {
            title: "No accessible bar counter section (grandfathered)",
            value: "no_ada_counter",
          },
          {
            title: "Accessible bathroom stall too narrow / none available",
            value: "narrow_or_no_ada_bathroom",
          },
          {
            title: "Gravel / cobblestone / uneven patio surface",
            value: "uneven_patio_surface",
          },
          {
            title: "No on-site accessible parking",
            value: "no_ada_parking",
          },
          {
            title: "Ramp present but steep / non-compliant grade",
            value: "steep_ramp",
          },
          { title: "Narrow doorway between rooms", value: "narrow_doorway" },
        ],
        layout: "grid",
      },
      fieldset: "experience",
    },
    {
      name: "accessibilityAccommodations",
      title: "Accessibility — Non-Standard Accommodations",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          {
            title: "Multiple ADA-height table options",
            value: "multiple_ada_tables",
          },
          {
            title: "Portable ramp available on request",
            value: "portable_ramp",
          },
          {
            title: "Elevator access to upper floor / rooftop",
            value: "elevator_access",
          },
          {
            title: "Dedicated accessible parking spot",
            value: "dedicated_ada_parking",
          },
          {
            title: "Separate accessible entrance (no need to ask staff)",
            value: "separate_accessible_entrance",
          },
          {
            title: "Staff proactively assist",
            value: "staff_proactive_assist",
          },
        ],
        layout: "grid",
      },
      fieldset: "experience",
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
      name: "allergensFree",
      title: "Allergens — Not Present on Menu",
      description:
        "Allergen genuinely absent from most/all dishes, not just removable on request.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: ALLERGEN_OPTIONS,
        layout: "grid",
      },
      fieldset: "experience",
    },
    {
      name: "allergensModifiable",
      title: "Allergens — Present, Can Be Modified / Substituted",
      description:
        "Allergen appears on the menu but can be removed or swapped on request.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: ALLERGEN_OPTIONS,
        layout: "grid",
      },
      fieldset: "experience",
    },
    {
      title: "Notes",
      name: "notes",
      description: "Anything else you want to add?",
      fieldset: "experience",
      type: "text",
      rows: 3,
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
  ],
};
