# Chat Components

Real-time chat system components for tenant-landlord communication.

## Components

### ChatInterface
Main chat interface component that handles real-time messaging.

**Features:**
- Real-time message updates via Firebase Realtime Database
- Typing indicators
- Read receipts
- File attachments (images, PDFs)
- Auto-scroll to latest messages
- Chat unlock status check

**Usage:**
```tsx
import { ChatInterface } from '@/components/chat'

<ChatInterface
  application={applicationWithDetails}
  onBack={() => router.back()}
/>
```

### ChatList
Displays a list of all chat conversations with preview.

**Features:**
- Last message preview
- Unread message count badges
- Property information display
- Real-time updates
- Click to open chat

**Usage:**
```tsx
import { ChatList } from '@/components/chat'

<ChatList
  chats={chatListItems}
  currentUserId={user.id}
  isLoading={loading}
/>
```

### ChatMessage
Individual message bubble component.

**Features:**
- Sender avatar
- Message text with line breaks
- Image and document attachments
- Timestamp with relative time
- Read status indicators (single/double check)
- Different styling for own vs other messages

**Props:**
- `message`: RealtimeMessage object
- `isOwnMessage`: boolean
- `senderName`: string
- `senderPhoto`: string (optional)
- `showAvatar`: boolean (default: true)

### ChatInput
Message input component with file upload support.

**Features:**
- Multi-line text input
- File attachment support (images, PDFs, documents)
- File preview before sending
- Typing indicator trigger
- Send on Enter, new line on Shift+Enter
- File validation (type and size)

**Props:**
- `onSendMessage`: (text: string, files: File[]) => Promise<void>
- `onTyping`: (isTyping: boolean) => void (optional)
- `disabled`: boolean (default: false)
- `placeholder`: string (default: "Type a message...")

### TypingIndicator
Animated typing indicator component.

**Features:**
- Animated dots
- User name display
- Smooth animations

**Props:**
- `userName`: string
- `className`: string (optional)

## Firebase Realtime Database Structure

```json
{
  "chats": {
    "application_123": {
      "participants": {
        "tenant_id": true,
        "landlord_id": true
      },
      "messages": {
        "msg_1": {
          "sender_id": "user_id",
          "text": "Hello!",
          "timestamp": 1234567890,
          "read_at": null,
          "attachments": "[{\"type\":\"image\",\"url\":\"...\"}]"
        }
      },
      "typing": {
        "tenant_id": false,
        "landlord_id": false
      },
      "last_message": {
        "text": "Hello!",
        "sender_id": "user_id",
        "timestamp": 1234567890
      }
    }
  }
}
```

## API Endpoints

### GET /api/chats/:applicationId
Get chat messages and participants.

**Response:**
```json
{
  "messages": [...],
  "participants": {
    "tenant": {...},
    "landlord": {...}
  }
}
```

### POST /api/chats/:applicationId/messages
Send a new message.

**Request:**
```json
{
  "sender_id": "user_id",
  "text": "Hello!",
  "attachments": [...]
}
```

**Response:**
```json
{
  "message": {...}
}
```

### PUT /api/chats/:applicationId/messages/:messageId/read
Mark a message as read.

**Response:**
```json
{
  "success": true
}
```

## Security Rules

Chat access is restricted to participants only:
- Users can only read/write to chats where they are participants
- Participants are determined by the application's tenant_id and landlord_id
- Messages must have valid sender_id matching the authenticated user
- Text messages are limited to 5000 characters

## File Upload

Supported file types:
- Images: image/* (max 10MB)
- PDFs: application/pdf (max 10MB)
- Documents: .doc, .docx (max 10MB)

Files are uploaded to Firebase Storage at:
`chats/{applicationId}/{timestamp}_{filename}`

## Real-time Features

1. **Message Updates**: Messages are synced in real-time using Firebase Realtime Database
2. **Typing Indicators**: Typing status is updated in real-time with auto-clear after 3 seconds
3. **Read Receipts**: Messages are marked as read when viewed
4. **Presence**: User online/offline status (optional feature)

## Usage Example

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ChatInterface } from '@/components/chat'
import { getApplication } from '@/lib/firebase/applications'

export default function ChatPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadApplication() {
      const app = await getApplication(params.id)
      setApplication(app)
      setLoading(false)
    }
    loadApplication()
  }, [params.id])

  if (loading) return <div>Loading...</div>
  if (!application) return <div>Application not found</div>

  return (
    <div className="h-screen">
      <ChatInterface
        application={application}
        onBack={() => window.history.back()}
      />
    </div>
  )
}
```

## Dependencies

- Firebase Realtime Database
- Firebase Storage
- date-fns (for time formatting)
- lucide-react (for icons)
- shadcn/ui components (Button, Card, Badge, ScrollArea, Textarea)

## Notes

- Messages are stored in both Realtime Database (for real-time sync) and Firestore (for persistence)
- Chat is only unlocked when application status is 'chat_open' (mutual like)
- File attachments are stored as JSON strings in Realtime Database
- Typing indicators auto-clear after 3 seconds of inactivity
- Messages are automatically marked as read when the chat is viewed
