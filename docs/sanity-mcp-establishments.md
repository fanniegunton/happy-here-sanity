# Happy Here — Working with Establishments via the Sanity MCP

Instructions for Claude when asked to search, edit, or create `establishment` documents for Happy Here (an Austin happy hour directory) using the Sanity MCP tools. This document is self-contained: everything needed is inlined here, and all work happens through MCP calls — no local repo, CLI, or scripts required.

## Project coordinates

Every Sanity MCP call takes a `resource` parameter. Always use:

```json
{ "projectId": "9h94j7zr", "dataset": "production" }
```

If MCP calls fail with `Unauthorized - Session not found`, ask the user to run `npx sanity@latest mcp configure` and restart their MCP client — don't try to work around it.

## Golden rules

1. **Never publish without being asked.** `patch_documents` and `create_documents` write drafts (`drafts.*`) — that's the desired behavior. The user reviews and publishes in Sanity Studio. Only call `publish_documents` when explicitly told to publish.
2. **Follow the hours format exactly** (spec below) when writing `happyHourTimes` or `hours`.
3. **`unverified` is inverted.** Despite the name, `unverified: true` means the happy hour **is verified** (its Studio label is "HH Verified!"); `false` means not yet verified. Don't "fix" this, and don't set it unless the user says they verified something.
4. **Don't touch `location`.** Published docs carry a `location: {lat, lng}` field that isn't in the Studio schema — it's managed by the front-end pipeline. Never set, overwrite, or delete it.
5. **Check for duplicates before creating.** Search by name (case-insensitive, partial match) before adding a new establishment.

## Searching

Use `query_documents` with GROQ. Use `perspective: "published"` for live content, `"drafts"` to see pending edits, `"raw"` to see both (drafts appear with a `drafts.` id prefix).

```groq
// Find by name (case-insensitive partial match)
*[_type == "establishment" && name match "tiger*"]{_id, name, address}

// By neighborhood region
*[_type == "establishment" && neighborhood.region == "east"]{_id, name, neighborhood}

// Missing happy hour times
*[_type == "establishment" && !defined(happyHourTimes)]{_id, name}

// Not yet verified (remember: unverified == false means NOT verified)
*[_type == "establishment" && unverified == false]{_id, name}

// Has a patio and cocktails
*[_type == "establishment" && "patio" in theSpaceIsLike && "cocktails" in whatWeHaveHere]{_id, name}

// Pending drafts
*[_id in path("drafts.**") && _type == "establishment"]{_id, name}
```

`get_document` fetches one doc by exact `_id` (IDs are UUIDs like `17c0e76f-7bd8-...`; drafts are `drafts.<uuid>`).

## Editing

Use `patch_documents` with the **published (base) id** — Sanity creates/updates the draft automatically:

```json
{
  "resource": { "projectId": "9h94j7zr", "dataset": "production" },
  "documents": {
    "<document-id>": {
      "patches": [
        { "set": { "happyHourTimes": ["Mon-Fri: 4PM-6PM"], "happyHourMenu": "https://..." } }
      ]
    }
  }
}
```

- `set` replaces the whole value at a path — for array fields, supply the complete new array.
- `unset` removes fields: `{ "unset": ["happyHourDetails"] }`.
- After patching, tell the user which drafts are pending so they can review and publish in Studio.

## Creating

Use `create_documents` with `type: "establishment"`. Omit `_id` (let Sanity generate one). This creates a draft.

Required fields: `name`, `address`, `neighborhood` (with `region`). Include what's known; leave unknown fields out entirely rather than guessing.

```json
{
  "type": "establishment",
  "content": {
    "name": "Example Bar",
    "address": "123 E 6th St, Austin, TX 78701",
    "website": "https://example.com",
    "instagram": "https://www.instagram.com/example/",
    "neighborhood": { "region": "downtown", "subNeighborhoodDowntown": "downtown" },
    "hours": ["Mon-Sun: 4PM-12AM"],
    "happyHourTimes": ["Mon-Fri: 4PM-6PM"],
    "happyHourDetails": "$5 wells, half-price snacks",
    "whatWeHaveHere": ["beer", "cocktails", "food"],
    "theSpaceIsLike": ["indoor", "patio"],
    "unverified": false
  }
}
```

New establishments start with `unverified: false` (not yet verified). Don't set `photo` — image uploads happen in Studio.

## Hours format (`hours` and `happyHourTimes`)

Each array entry is one string: **day range**, colon, space, **time range** — `Mon-Fri: 3PM-6PM`. Multiple day/time combos are separate array items:

```json
["Mon-Thu: 4PM-7PM", "Fri: 2PM-7PM", "Sat-Sun: 12PM-5PM"]
```

**Days:** three-letter abbreviations `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`. Ranges are hyphenated with no spaces (`Mon-Fri`); wrap-around ranges are allowed (`Fri-Mon` = Fri, Sat, Sun, Mon); single days stand alone (`Fri: 2PM-7PM`).

**Times:** number directly against the AM/PM suffix, no space — `12PM`, `3:30PM`, `11AM`. Ranges hyphenated with no spaces (`3PM-6PM`), and AM/PM must appear on **both** start and end times.

Common mistakes to avoid:

| Wrong | Right | Issue |
|---|---|---|
| `4-6PM` | `4PM-6PM` | Missing AM/PM on start time |
| `5PM to 6PM` | `5PM-6PM` | "to" instead of hyphen |
| `3pm–8pm` | `3PM-8PM` | Lowercase; en-dash (–) instead of hyphen (-) |
| `3PM – 6PM` | `3PM-6PM` | Spaces around separator |
| `Mon – Fri: 3PM – 6PM` | `Mon-Fri: 3PM-6PM` | En-dashes and spaces throughout |

## Field reference

### Core fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | required |
| `address` | text | required, full street address |
| `neighborhood` | object | required — see below |
| `website`, `instagram`, `happyHourMenu` | url | full URLs including `https://` |
| `hours`, `happyHourTimes` | array of strings | must follow the hours format above |
| `happyHourDetails` | text | free text, deals/prices |
| `whatWeHaveHere` | array of strings | `beer`, `wine`, `cocktails`, `naDrinks`, `coffee`, `food`, `merch` |
| `theSpaceIsLike` | array of strings | `indoor`, `patio`, `barSeating`, `dogFriendly`, `smallGroups`, `bigGroups`, `reservationsRec`, `staffPick` |
| `unverified` | boolean | **inverted**: `true` = HH verified |
| `needsReview` | boolean | set by automated verification runs — don't set manually |
| `photo` | image | don't set via MCP |
| `location` | object | `{lat, lng}`, not in schema — never modify |

### Neighborhood

`neighborhood.region` is one of: `central`, `downtown`, `east`, `north`, `northeast`, `northwest`, `southCentral`, `southeast`, `southwest`, `west`.

The sub-neighborhood lives in a **region-specific field** matching the chosen region — set only the one that corresponds to `region`, only when the address clearly falls in it, and omit it if unsure:

| Region | Field | Allowed values |
|---|---|---|
| `downtown` | `subNeighborhoodDowntown` | `downtown`, `raineyStreet`, `warehouseDistrict`, `secondStreetDistrict` |
| `central` | `subNeighborhoodCentral` | `westCampusTheDrag`, `northUniversity`, `hydePark`, `hancock`, `rosedale`, `brykerWoods`, `oldEnfield`, `oldWestAustinClarksville`, `pembertonHeights`, `tarrytown`, `judgesHill` |
| `east` | `subNeighborhoodEast` | `eastCesarChavez`, `cherrywoodFrenchPlace`, `centralEastAustin`, `holly`, `govalle`, `mueller`, `windsorPark`, `coronadoHills`, `delwood`, `stJohn` |
| `north` | `subNeighborhoodNorth` | `northLoop`, `brentwood`, `crestview`, `allandale`, `northShoalCreek`, `wooten`, `northBurnetHighland` |
| `northeast` | `subNeighborhoodNortheast` | `georgianAcres`, `gracyWoods`, `harrisBranch`, `rundberg`, `copperfield` |
| `northwest` | `subNeighborhoodNorthwest` | `andersonMill`, `northwestHillsGreatHills`, `balconesWoods`, `canyonCreek` |
| `southCentral` | `subNeighborhoodSouthCentral` | `bouldinCreek`, `travisHeightsFairview`, `soco`, `bartonHills`, `dawson`, `galindo`, `zilker` |
| `southeast` | `subNeighborhoodSoutheast` | `eastRiverside`, `montopolis`, `pleasantValley`, `doveSprings`, `onionCreek`, `southeastAustin` |
| `southwest` | `subNeighborhoodSouthwest` | `oakHill`, `circleCRanch`, `shadyHollow`, `tanglewoodForest`, `westgate` |
| `west` | `subNeighborhoodWest` | `farWest`, `westLakeHills`, `bartonCreek`, `catMountain`, `lostCreek` |

### Experience fields

Usually filled from personal visits — only set these when the user provides the info.

| Field | Type | Allowed values / notes |
|---|---|---|
| `quickDescription` | string | short phrase |
| `vibeTags` | array | `romantic`, `cozy`, `upscale`, `casual`, `trendy`, `divey`, `classy`, `laidback`, `lively`, `rustic`, `industrial`, `speakeasy` |
| `seating` | text | free text |
| `seatingTypes` | array | `booths`, `high_top`, `communal`, `bar_counter`, `lounge`, `rooftop`, `standing_room` |
| `seatingDetails` | array | `reservable`, `large_groups`, `covered_outdoor`, `pet_friendly`, `private_area`, `waitlist` |
| `lighting` | text | free text |
| `lightingTypes` | array | `dim_moody`, `bright`, `natural`, `string_lights`, `candlelit`, `neon`, `exposed_bulb` |
| `lightingDetails` | array | `photo_flattering`, `shifts_day_to_night`, `patio_dark_at_night`, `statement_fixtures`, `screen_heavy` |
| `goodForConversation` | string | `gfc_1` (too loud) … `gfc_5` (quiet and intimate) |
| `staffWarmth` | string | `"1"` (bordering on rude) … `"5"` (the CHEERS experience) — string, not number |
| `music` | text | free text |
| `bathrooms` | text | free text |
| `bathroomDetails` | array | `single_occupancy`, `gender_neutral`, `notably_clean`, `notably_unmaintained`, `long_wait`, `separate_structure`, `distinctive_decor` |
| `interiorDesign` | text | free text |
| `designedBy` | text | free text |
| `accessibility` | text | free text |
| `accessibilityIssues` | array | `no_ada_entrance`, `no_ada_counter`, `narrow_or_no_ada_bathroom`, `uneven_patio_surface`, `no_ada_parking`, `steep_ramp`, `narrow_doorway` |
| `accessibilityAccommodations` | array | `multiple_ada_tables`, `portable_ramp`, `elevator_access`, `dedicated_ada_parking`, `separate_accessible_entrance`, `staff_proactive_assist` |
| `allergyFriendly` | text | free text |
| `allergensFree` | array | allergens genuinely absent from the menu: `milk`, `eggs`, `fish`, `shellfish`, `tree_nuts`, `peanuts`, `wheat`, `soy`, `sesame`, `gluten` |
| `allergensModifiable` | array | allergens present but removable on request — same values as `allergensFree` |
| `notes` | text | free text |

### Ownership fields

| Field | Type | Allowed values / notes |
|---|---|---|
| `ownershipIdentifiedAs` | array | `blackOwned`, `latinoOwned`, `lgbtqaplusOwned`, `womenOwned`, `nativeOwned`, `aapiOwned`, `bipocOwned` |
| `keyPeople` | array of strings | owners, chefs, program managers |
| `localOrNot` | boolean | `true` = local to Austin, `false` = part of a larger chain; omit if unknown |
| `ownershipGroup` | string | parent restaurant group, if any |

## Publishing (only when asked)

Use `publish_documents` with the draft ids the user wants published. Publish only the specific documents the user named — never sweep all pending drafts, since some may be in-progress manual edits from Studio.
