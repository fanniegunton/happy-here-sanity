# Hours Formatting

The `happyHourTimes` and `hours` fields on `establishment` documents use a structured string format for consistent parsing.

## Format

Each entry is a single string: **day range**, colon, space, **time range**.

```
Mon-Fri: 3PM-6PM
```

Multiple entries for different day/time combos go as separate array items:

```json
["Mon-Thu: 4PM-7PM", "Fri: 2PM-7PM", "Sat-Sun: 12PM-5PM"]
```

## Days

Use three-letter abbreviations: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`

- **Ranges** are hyphenated with no spaces: `Mon-Fri`, `Tue-Thu`, `Sat-Sun`
- **Wrap-around ranges** work as expected: `Fri-Mon` means Fri, Sat, Sun, Mon
- **Single days** stand alone: `Fri: 2PM-7PM`

## Times

Use `12PM`, `3:30PM`, `11AM` — number directly against the AM/PM suffix, no space.

- **Ranges** are hyphenated with no spaces: `3PM-6PM`, `4:30PM-7PM`
- Always include AM/PM on **both** the start and end time

## Common mistakes to avoid

| Wrong | Right | Issue |
|---|---|---|
| `4-6PM` | `4PM-6PM` | Missing AM/PM on start time |
| `5PM to 6PM` | `5PM-6PM` | "to" instead of hyphen |
| `3pm–8pm` | `3PM-8PM` | En-dash (–) instead of hyphen (-) |
| `3PM – 6PM` | `3PM-6PM` | Spaces around separator |
| `Mon – Fri: 3PM – 6PM` | `Mon-Fri: 3PM-6PM` | En-dashes and spaces throughout |
| `Mon\u200a–\u200aFri` | `Mon-Fri` | Thin/hair spaces with en-dash |
