export default {
  name: 'settings',
  title: 'Settings',
  type: 'document',
  fields: [
    { 
      title: "Site Name",
      name: "siteName",
      type: "string",
      validation: Rule => Rule.required(),
    },
    {
      title: "Site Description",
      name: "siteDescription",
      type: "text",
      // validation: Rule => Rule.required(),
    },
    {
      title: "Site Logo",
      name: "siteLogo",
      type: "image",
      // validation: Rule => Rule.required(),
    },
    {
      title: "Instagram Handle",
      name: "instagramHandle",
      type: "string",
      // validation: Rule => Rule.required(),
    },
    {
      title: "Threads Handle",
      name: "threadsHandle",
      type: "string",
      // validation: Rule => Rule.required(),
    },
    {
      title: "Email",
      name: "email",
      type: "string",
      // validation: Rule => Rule.required(),
    },
    {
      title: "Takeout Tracker Link",
      name: "takeoutTrackerLink",
      type: "url",
      // validation: Rule => Rule.required(),
    },
    {
      title: "Donation Link 1",
      name: "donationLink1",
      type: "url",
    },
    {
      title: "Donation Link 2",
      name: "donationLink2",
      type: "url",
    },
    {
      title: "Donation Link 3",
      name: "donationLink3",
      type: "url",
    },
  ],
}
