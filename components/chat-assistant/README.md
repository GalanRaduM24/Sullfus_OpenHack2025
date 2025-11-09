# Chat Assistant Components

AI-powered chat assistant for helping tenants set search preferences through natural conversation.

## Components

### ChatAssistantWidget
Floating button that opens the chat assistant dialog.

**Usage:**
```tsx
import { ChatAssistantWidget } from '@/components/chat-assistant'

<ChatAssistantWidget 
  onFiltersApplied={(filters) => {
    console.log('Filters applied:', filters)
  }}
/>
```

**Props:**
- `onFiltersApplied?: (filters: ExtractedFilters) => void` - Callback when filters are applied
- `className?: string` - Additional CSS classes

### ChatAssistantDialog
Full chat interface with message history and filter summary.

**Usage:**
```tsx
import { ChatAssistantDialog } from '@/components/chat-assistant'

<ChatAssistantDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onFiltersApplied={(filters) => {
    console.log('Filters applied:', filters)
  }}
/>
```

**Props:**
- `open: boolean` - Dialog open state
- `onOpenChange: (open: boolean) => void` - Callback when dialog state changes
- `onFiltersApplied?: (filters: ExtractedFilters) => void` - Callback when filters are applied

### ChatMessage
Individual message bubble component.

**Usage:**
```tsx
import { ChatMessage } from '@/components/chat-assistant'

<ChatMessage
  role="user"
  content="I'm looking for a 2-bedroom apartment"
  timestamp={new Date()}
/>
```

**Props:**
- `role: 'user' | 'assistant'` - Message sender
- `content: string` - Message text
- `timestamp?: Date` - Message timestamp

### FilterSummary
Display extracted search filters with badges.

**Usage:**
```tsx
import { FilterSummary } from '@/components/chat-assistant'

<FilterSummary
  filters={{
    budgetMin: 1500,
    budgetMax: 2000,
    locations: ['Bucharest'],
    amenities: ['parking', 'furnished'],
    petsAllowed: true
  }}
  onApply={() => console.log('Apply filters')}
  onClear={() => console.log('Clear filters')}
  onRemoveFilter={(key, value) => console.log('Remove filter', key, value)}
/>
```

**Props:**
- `filters: ExtractedFilters` - Current filters
- `onApply?: () => void` - Callback when apply button is clicked
- `onClear?: () => void` - Callback when clear all is clicked
- `onRemoveFilter?: (filterKey: string, value?: string) => void` - Callback when individual filter is removed

## API Endpoints

### POST /api/chat-assistant/message
Process chat message and extract filters using GPT-4.

**Request:**
```json
{
  "tenant_id": "user123",
  "message": "I'm looking for a 2-bedroom apartment in Bucharest",
  "conversation_history": [
    { "role": "assistant", "content": "Hi! What's your budget?" },
    { "role": "user", "content": "Around 1500-2000 RON" }
  ]
}
```

**Response:**
```json
{
  "response": "Great! A 2-bedroom in Bucharest for 1500-2000 RON. Any specific amenities?",
  "extractedFilters": {
    "budgetMin": 1500,
    "budgetMax": 2000,
    "locations": ["Bucharest"],
    "propertyType": ["2br"]
  },
  "action": "continue"
}
```

### POST /api/chat-assistant/apply-filters
Apply extracted filters to tenant search preferences.

**Request:**
```json
{
  "tenant_id": "user123",
  "filters": {
    "budgetMin": 1500,
    "budgetMax": 2000,
    "locations": ["Bucharest"],
    "amenities": ["parking", "furnished"],
    "petsAllowed": true,
    "propertyType": ["2br"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "filter_id": "filter_1234567890",
  "applied_filters": {
    "budget_min": 1500,
    "budget_max": 2000,
    "locations": ["Bucharest"],
    "amenities": ["parking", "furnished"],
    "pets_allowed": true,
    "property_type": ["2br"]
  }
}
```

## Features

- **Natural Language Processing**: Uses GPT-4 to understand tenant requirements
- **Filter Extraction**: Automatically extracts search parameters from conversation
- **Real-time Updates**: Filters update as conversation progresses
- **Visual Feedback**: Filter summary shows current search criteria
- **Persistent Storage**: Conversation history stored in Firestore
- **Mobile Responsive**: Works on all screen sizes

## Data Flow

1. User opens chat assistant widget
2. User types message about their requirements
3. Message sent to `/api/chat-assistant/message`
4. OpenAI GPT-4 processes message and extracts filters
5. Response and filters returned to UI
6. Filters displayed in FilterSummary component
7. User confirms and applies filters
8. Filters sent to `/api/chat-assistant/apply-filters`
9. Tenant profile updated with search preferences
10. Property search triggered with new filters

## Firestore Structure

### Conversation Storage
```
tenant_profiles/{tenant_id}/chat_assistant_conversations/current
{
  messages: [
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' }
  ],
  extracted_filters: { ... },
  last_updated: timestamp
}
```

### Filter History
```
tenant_profiles/{tenant_id}/filter_history/{filter_id}
{
  filters: { ... },
  applied_at: timestamp,
  source: 'chat_assistant'
}
```

## Requirements Covered

- **Requirement 6.1**: Chat interface on tenant dashboard ✓
- **Requirement 6.2**: AI extracts search parameters ✓
- **Requirement 6.3**: Confirms extracted filters with tenant ✓
- **Requirement 6.4**: Saves search preferences to profile ✓
- **Requirement 6.5**: Updates property results based on filters ✓

## Future Enhancements

- [ ] Voice input support
- [ ] Multi-language support
- [ ] Property recommendations based on conversation
- [ ] Save multiple filter presets
- [ ] Share filters with friends
- [ ] Filter suggestions based on popular searches
