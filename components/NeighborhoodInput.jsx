import { Stack } from '@sanity/ui'
import { MemberField } from 'sanity'

export function NeighborhoodInput(props) {
  const { members, renderField, renderInput, renderItem, renderPreview } = props

  return (
    <Stack space={2}>
      {members.map((member) => {
        if (member.kind !== 'field') return null
        return (
          <MemberField
            key={member.key}
            member={member}
            renderField={renderField}
            renderInput={renderInput}
            renderItem={renderItem}
            renderPreview={renderPreview}
          />
        )
      })}
    </Stack>
  )
}
