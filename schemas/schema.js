// // First, we must import the schema creator
// import createSchema from "part:@sanity/base/schema-creator";

// // Then import schema types from any plugins that might expose them
// import schemaTypes from "all:part:@sanity/base/schema-type";

// We import object and document schemas
import blockContent from "./blockContent";
import category from "./category";
import post from "./post";
import establishment from "./establishment";
import settings from "./settings";
import dayAndTime from "./objects/dayAndTime";
import placeholderImages from "./placeholderImages";

// Then we give our schema to the builder and provide the result to Sanity
export default [
  // The following are document types which will appear
  // in the studio.
  post,
  category,
  establishment,
  settings,
  placeholderImages,
  // When added to this list, object types can be used as
  // { type: 'typename' } in other document schemas
  blockContent,
  dayAndTime,
];
