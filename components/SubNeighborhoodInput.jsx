import { useCallback, useEffect, useMemo, useState } from "react"
import { Select } from "@sanity/ui"
import { set, unset, useClient, useFormValue } from "sanity"
import { SUB_NEIGHBORHOODS } from "../schemas/objects/neighborhood"

// Options for `subNeighborhood` on `neighborhoodProfile`: scoped to the
// selected `region`, minus sub-neighborhoods already claimed by other
// neighborhoodProfile documents (the doc's own current value stays available).
export function SubNeighborhoodInput(props) {
  const { value, onChange, elementProps } = props
  const client = useClient({ apiVersion: "2024-01-01" })
  const region = useFormValue(["region"])
  const docId = useFormValue(["_id"])
  const [taken, setTaken] = useState([])
  const [loading, setLoading] = useState(false)

  const baseId =
    typeof docId === "string" ? docId.replace(/^drafts\./, "") : docId

  useEffect(() => {
    if (!region || !baseId) {
      setTaken([])
      return
    }

    let cancelled = false
    setLoading(true)

    client
      .fetch(
        `*[_type == "neighborhoodProfile" && region == $region && !(_id in [$id, $draftId])].subNeighborhood`,
        { region, id: baseId, draftId: `drafts.${baseId}` }
      )
      .then((values) => {
        if (!cancelled) setTaken(values.filter(Boolean))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [client, region, baseId])

  const options = useMemo(() => {
    if (!region) return []
    const list = SUB_NEIGHBORHOODS[region] || []
    return list.filter((opt) => opt.value === value || !taken.includes(opt.value))
  }, [region, taken, value])

  const handleChange = useCallback(
    (event) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  return (
    <Select
      {...elementProps}
      value={value || ""}
      disabled={!region}
      onChange={handleChange}
    >
      <option value="">
        {!region
          ? "Select a region first"
          : loading
            ? "Loading…"
            : "Select a sub-neighborhood"}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.title}
        </option>
      ))}
    </Select>
  )
}
