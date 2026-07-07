import { NeighborhoodInput } from '../../components/NeighborhoodInput'

const REGIONS = [
  { title: "Central", value: "central" },
  { title: "Downtown", value: "downtown" },
  { title: "East", value: "east" },
  { title: "North", value: "north" },
  { title: "Northeast", value: "northeast" },
  { title: "Northwest", value: "northwest" },
  { title: "South Central", value: "southCentral" },
  { title: "Southeast", value: "southeast" },
  { title: "Southwest", value: "southwest" },
  { title: "West", value: "west" },
];

const SUB_NEIGHBORHOODS = {
  downtown: [
    { title: "Downtown", value: "downtown" },
    { title: "Rainey Street", value: "raineyStreet" },
    { title: "Warehouse District", value: "warehouseDistrict" },
    { title: "Second Street District", value: "secondStreetDistrict" },
  ],
  central: [
    { title: "West Campus / The Drag", value: "westCampusTheDrag" },
    { title: "North University", value: "northUniversity" },
    { title: "Hyde Park", value: "hydePark" },
    { title: "Hancock", value: "hancock" },
    { title: "Rosedale", value: "rosedale" },
    { title: "Bryker Woods", value: "brykerWoods" },
    { title: "Old Enfield", value: "oldEnfield" },
    {
      title: "Old West Austin / Clarksville",
      value: "oldWestAustinClarksville",
    },
    { title: "Pemberton Heights", value: "pembertonHeights" },
    { title: "Tarrytown", value: "tarrytown" },
    { title: "Judges' Hill", value: "judgesHill" },
  ],
  east: [
    { title: "East Cesar Chavez", value: "eastCesarChavez" },
    { title: "Cherrywood / French Place", value: "cherrywoodFrenchPlace" },
    { title: "Central East Austin", value: "centralEastAustin" },
    { title: "Holly", value: "holly" },
    { title: "Govalle", value: "govalle" },
    { title: "Mueller", value: "mueller" },
    { title: "Windsor Park", value: "windsorPark" },
    { title: "Coronado Hills", value: "coronadoHills" },
    { title: "Delwood", value: "delwood" },
    { title: "St. John", value: "stJohn" },
  ],
  north: [
    { title: "North Loop", value: "northLoop" },
    { title: "Brentwood", value: "brentwood" },
    { title: "Crestview", value: "crestview" },
    { title: "Allandale", value: "allandale" },
    { title: "North Shoal Creek", value: "northShoalCreek" },
    { title: "Wooten", value: "wooten" },
    { title: "North Burnet / Highland", value: "northBurnetHighland" },
  ],
  northwest: [
    { title: "Anderson Mill", value: "andersonMill" },
    {
      title: "Northwest Hills / Great Hills",
      value: "northwestHillsGreatHills",
    },
    { title: "Balcones Woods", value: "balconesWoods" },
    { title: "Canyon Creek", value: "canyonCreek" },
  ],
  northeast: [
    { title: "Georgian Acres", value: "georgianAcres" },
    { title: "Gracy Woods", value: "gracyWoods" },
    { title: "Harris Branch", value: "harrisBranch" },
    { title: "Rundberg", value: "rundberg" },
    { title: "Copperfield", value: "copperfield" },
  ],
  southCentral: [
    { title: "Bouldin Creek", value: "bouldinCreek" },
    { title: "Travis Heights / Fairview", value: "travisHeightsFairview" },
    { title: "SoCo (South Congress)", value: "soco" },
    { title: "Barton Hills", value: "bartonHills" },
    { title: "Dawson", value: "dawson" },
    { title: "Galindo", value: "galindo" },
    { title: "Zilker", value: "zilker" },
  ],
  southeast: [
    { title: "East Riverside", value: "eastRiverside" },
    { title: "Montopolis", value: "montopolis" },
    { title: "Pleasant Valley", value: "pleasantValley" },
    { title: "Dove Springs", value: "doveSprings" },
    { title: "Onion Creek", value: "onionCreek" },
    { title: "Southeast Austin", value: "southeastAustin" },
  ],
  southwest: [
    { title: "Oak Hill", value: "oakHill" },
    { title: "Circle C Ranch", value: "circleCRanch" },
    { title: "Shady Hollow", value: "shadyHollow" },
    { title: "Tanglewood Forest", value: "tanglewoodForest" },
    { title: "Westgate", value: "westgate" },
  ],
  west: [
    { title: "Far West", value: "farWest" },
    { title: "West Lake Hills", value: "westLakeHills" },
    { title: "Barton Creek", value: "bartonCreek" },
    { title: "Cat Mountain", value: "catMountain" },
    { title: "Lost Creek", value: "lostCreek" },
  ],
};

const allSubNeighborhoods = Object.values(SUB_NEIGHBORHOODS).flat();

export default {
  name: "neighborhood",
  title: "Neighborhood",
  type: "object",
  components: {
    input: NeighborhoodInput,
  },
  fields: [
    {
      name: "region",
      title: "Region",
      type: "string",
      options: {
        list: REGIONS,
      },
    },
    {
      name: "subNeighborhoodDowntown",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "downtown",
      options: { list: SUB_NEIGHBORHOODS.downtown },
    },
    {
      name: "subNeighborhoodCentral",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "central",
      options: { list: SUB_NEIGHBORHOODS.central },
    },
    {
      name: "subNeighborhoodEast",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "east",
      options: { list: SUB_NEIGHBORHOODS.east },
    },
    {
      name: "subNeighborhoodNorth",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "north",
      options: { list: SUB_NEIGHBORHOODS.north },
    },
    {
      name: "subNeighborhoodNortheast",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "northeast",
      options: { list: SUB_NEIGHBORHOODS.northeast },
    },
    {
      name: "subNeighborhoodNorthwest",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "northwest",
      options: { list: SUB_NEIGHBORHOODS.northwest },
    },
    {
      name: "subNeighborhoodSouthCentral",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "southCentral",
      options: { list: SUB_NEIGHBORHOODS.southCentral },
    },
    {
      name: "subNeighborhoodSoutheast",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "southeast",
      options: { list: SUB_NEIGHBORHOODS.southeast },
    },
    {
      name: "subNeighborhoodSouthwest",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "southwest",
      options: { list: SUB_NEIGHBORHOODS.southwest },
    },
    {
      name: "subNeighborhoodWest",
      title: "Sub-neighborhood",
      type: "string",
      hidden: ({ parent }) => parent?.region !== "west",
      options: { list: SUB_NEIGHBORHOODS.west },
    },
  ],
  preview: {
    select: {
      region: "region",
      subDowntown: "subNeighborhoodDowntown",
      subCentral: "subNeighborhoodCentral",
      subEast: "subNeighborhoodEast",
      subNorth: "subNeighborhoodNorth",
      subNortheast: "subNeighborhoodNortheast",
      subNorthwest: "subNeighborhoodNorthwest",
      subSouthCentral: "subNeighborhoodSouthCentral",
      subSoutheast: "subNeighborhoodSoutheast",
      subSouthwest: "subNeighborhoodSouthwest",
      subWest: "subNeighborhoodWest",
    },
    prepare({
      region,
      subDowntown,
      subCentral,
      subEast,
      subNorth,
      subNortheast,
      subNorthwest,
      subSouthCentral,
      subSoutheast,
      subSouthwest,
      subWest,
    }) {
      const regionLabel = REGIONS.find((r) => r.value === region)?.title;
      const subValue =
        subDowntown ||
        subCentral ||
        subEast ||
        subNorth ||
        subNortheast ||
        subNorthwest ||
        subSouthCentral ||
        subSoutheast ||
        subSouthwest ||
        subWest;
      const subLabel = allSubNeighborhoods.find(
        (s) => s.value === subValue,
      )?.title;
      return {
        title: regionLabel ?? "No region selected",
        subtitle: subLabel,
      };
    },
  },
};
