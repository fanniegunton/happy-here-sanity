import { DocumentActionComponent, useDocumentOperation } from 'sanity'
import { useState } from 'react'
import { Dialog, Stack, Card, Text, TextInput, TextArea, Button, Box } from '@sanity/ui'
import { EditIcon } from '@sanity/icons'

export const ExperienceEntryAction: DocumentActionComponent = (props) => {
  const { id, type, draft, published } = props
  const { patch } = useDocumentOperation(id, type)
  const [isOpen, setIsOpen] = useState(false)
  
  // Only show for establishment documents
  if (type !== 'establishment') return null

  const doc = draft || published
  const experience = doc?.experience || {}

  const [formData, setFormData] = useState({
    quickDescription: experience.quickDescription || '',
    seating: experience.seating || '',
    lighting: experience.lighting || '',
    goodForConversation: experience.goodForConversation || '',
    staffNiceness: experience.staffNiceness || '',
    music: experience.music || '',
    bathrooms: experience.bathrooms || '',
    interiorDesign: experience.interiorDesign || '',
    accessibility: experience.accessibility || '',
    allergyFriendly: experience.allergyFriendly || '',
    notes: experience.notes || ''
  })

  const fields = [
    { name: 'quickDescription', label: 'Quick Description', type: 'input', placeholder: 'One-line vibe summary' },
    { name: 'seating', label: 'Seating', type: 'textarea', placeholder: 'Bar stools, booths, tables...' },
    { name: 'lighting', label: 'Lighting', type: 'textarea', placeholder: 'Bright, dim, moody...' },
    { name: 'goodForConversation', label: 'Good for Conversation', type: 'textarea', placeholder: 'Noise level, privacy...' },
    { name: 'staffNiceness', label: 'Staff Niceness', type: 'textarea', placeholder: 'Friendly, attentive...' },
    { name: 'music', label: 'Music', type: 'textarea', placeholder: 'Genre, volume...' },
    { name: 'bathrooms', label: 'Bathrooms', type: 'textarea', placeholder: 'Clean, accessible...' },
    { name: 'interiorDesign', label: 'Interior Design', type: 'textarea', placeholder: 'Modern, rustic, cozy...' },
    { name: 'accessibility', label: 'Accessibility', type: 'textarea', placeholder: 'Wheelchair access, ramps...' },
    { name: 'allergyFriendly', label: 'Allergy Friendly', type: 'textarea', placeholder: 'GF, vegan options...' },
    { name: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Other observations...' }
  ]

  const handleSave = () => {
    // Patch all experience fields at once
    Object.entries(formData).forEach(([key, value]) => {
      patch.execute([{ set: { [key]: value } }])
    })
    setIsOpen(false)
  }

  return {
    label: 'Quick Experience Entry',
    icon: EditIcon,
    onHandle: () => setIsOpen(true),
    dialog: isOpen && {
      type: 'dialog',
      onClose: () => setIsOpen(false),
      header: 'Experience Information',
      content: (
        <Box padding={4}>
          <Stack space={4}>
            {fields.map(field => (
              <Card key={field.name} padding={3} radius={2} border>
                <Stack space={2}>
                  <Text size={1} weight="semibold">{field.label}</Text>
                  {field.type === 'input' ? (
                    <TextInput
                      value={formData[field.name as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.currentTarget.value })}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <TextArea
                      value={formData[field.name as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.currentTarget.value })}
                      placeholder={field.placeholder}
                      rows={2}
                    />
                  )}
                </Stack>
              </Card>
            ))}
            <Button text="Save All Experience Data" tone="primary" onClick={handleSave} />
          </Stack>
        </Box>
      )
    }
  }
}
