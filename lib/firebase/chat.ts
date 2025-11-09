// Firebase Realtime Database Chat Operations
import {
  ref,
  push,
  set,
  update,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast,
  get,
  serverTimestamp,
  onDisconnect,
  DatabaseReference,
} from 'firebase/database'
import { realtimeDb } from './config'

// ============= TYPES =============

export interface RealtimeMessage {
  id: string
  sender_id: string
  text?: string
  attachments?: string // JSON string of attachment array
  timestamp: number
  read_at?: number | null
}

export interface RealtimeChatParticipants {
  [userId: string]: boolean
}

export interface RealtimeTypingStatus {
  [userId: string]: boolean
}

export interface RealtimeLastMessage {
  text: string
  sender_id: string
  timestamp: number
}

export interface RealtimeChat {
  participants: RealtimeChatParticipants
  messages?: {
    [messageId: string]: RealtimeMessage
  }
  typing?: RealtimeTypingStatus
  last_message?: RealtimeLastMessage
}

// ============= CHAT INITIALIZATION =============

/**
 * Initialize a chat room for an application
 */
export async function initializeChatRoom(
  applicationId: string,
  tenantId: string,
  landlordId: string
): Promise<void> {
  const chatRef = ref(realtimeDb, `chats/${applicationId}`)
  
  // Check if chat already exists
  const snapshot = await get(chatRef)
  if (snapshot.exists()) {
    return // Chat already initialized
  }

  // Create chat room with participants
  await set(chatRef, {
    participants: {
      [tenantId]: true,
      [landlordId]: true,
    },
    messages: {},
    typing: {
      [tenantId]: false,
      [landlordId]: false,
    },
  })
}

// ============= MESSAGE OPERATIONS =============

/**
 * Send a message to a chat
 */
export async function sendRealtimeMessage(
  applicationId: string,
  senderId: string,
  text?: string,
  attachments?: Array<{ type: string; url: string; name: string; size: number }>
): Promise<string> {
  const messagesRef = ref(realtimeDb, `chats/${applicationId}/messages`)
  const newMessageRef = push(messagesRef)
  
  const messageData: Partial<RealtimeMessage> = {
    sender_id: senderId,
    timestamp: Date.now(),
    read_at: null,
  }

  if (text) {
    messageData.text = text
  }

  if (attachments && attachments.length > 0) {
    messageData.attachments = JSON.stringify(attachments)
  }

  await set(newMessageRef, messageData)

  // Update last message
  const lastMessageRef = ref(realtimeDb, `chats/${applicationId}/last_message`)
  await set(lastMessageRef, {
    text: text || `Sent ${attachments?.length || 0} attachment(s)`,
    sender_id: senderId,
    timestamp: Date.now(),
  })

  return newMessageRef.key!
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(
  applicationId: string,
  messageId: string
): Promise<void> {
  const messageRef = ref(realtimeDb, `chats/${applicationId}/messages/${messageId}`)
  await update(messageRef, {
    read_at: Date.now(),
  })
}

/**
 * Mark all messages as read for a user
 */
export async function markAllMessagesAsRead(
  applicationId: string,
  userId: string
): Promise<void> {
  const messagesRef = ref(realtimeDb, `chats/${applicationId}/messages`)
  const snapshot = await get(messagesRef)

  if (!snapshot.exists()) {
    return
  }

  const updates: { [key: string]: any } = {}
  snapshot.forEach((childSnapshot) => {
    const message = childSnapshot.val() as RealtimeMessage
    // Mark as read if sent by someone else and not already read
    if (message.sender_id !== userId && !message.read_at) {
      updates[`${childSnapshot.key}/read_at`] = Date.now()
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(messagesRef, updates)
  }
}

// ============= TYPING INDICATORS =============

/**
 * Set typing status for a user
 */
export async function setTypingStatus(
  applicationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const typingRef = ref(realtimeDb, `chats/${applicationId}/typing/${userId}`)
  await set(typingRef, isTyping)

  // Auto-clear typing status after 3 seconds
  if (isTyping) {
    setTimeout(async () => {
      await set(typingRef, false)
    }, 3000)
  }
}

/**
 * Listen to typing status changes
 */
export function onTypingStatusChange(
  applicationId: string,
  callback: (typingStatus: RealtimeTypingStatus) => void
): () => void {
  const typingRef = ref(realtimeDb, `chats/${applicationId}/typing`)
  
  onValue(typingRef, (snapshot) => {
    const typingStatus = snapshot.val() || {}
    callback(typingStatus)
  })

  // Return unsubscribe function
  return () => off(typingRef)
}

// ============= MESSAGE LISTENERS =============

/**
 * Listen to new messages in a chat
 */
export function onMessagesChange(
  applicationId: string,
  callback: (messages: RealtimeMessage[]) => void,
  limit: number = 50
): () => void {
  const messagesRef = ref(realtimeDb, `chats/${applicationId}/messages`)
  const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(limit))

  onValue(messagesQuery, (snapshot) => {
    const messages: RealtimeMessage[] = []
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      })
    })
    callback(messages)
  })

  // Return unsubscribe function
  return () => off(messagesQuery)
}

/**
 * Get messages with pagination
 */
export async function getMessages(
  applicationId: string,
  limit: number = 50,
  beforeTimestamp?: number
): Promise<RealtimeMessage[]> {
  const messagesRef = ref(realtimeDb, `chats/${applicationId}/messages`)
  let messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(limit))

  const snapshot = await get(messagesQuery)
  const messages: RealtimeMessage[] = []

  snapshot.forEach((childSnapshot) => {
    const message = {
      id: childSnapshot.key!,
      ...childSnapshot.val(),
    } as RealtimeMessage

    // Filter by timestamp if provided
    if (!beforeTimestamp || message.timestamp < beforeTimestamp) {
      messages.push(message)
    }
  })

  return messages.sort((a, b) => a.timestamp - b.timestamp)
}

// ============= PRESENCE SYSTEM =============

/**
 * Set user online status
 */
export async function setUserOnlineStatus(userId: string, online: boolean): Promise<void> {
  const presenceRef = ref(realtimeDb, `user_presence/${userId}`)
  
  await set(presenceRef, {
    online,
    last_seen: Date.now(),
  })

  // Set up disconnect handler to mark user offline
  if (online) {
    const disconnectRef = onDisconnect(presenceRef)
    await disconnectRef.set({
      online: false,
      last_seen: Date.now(),
    })
  }
}

/**
 * Listen to user presence changes
 */
export function onUserPresenceChange(
  userId: string,
  callback: (online: boolean, lastSeen: number) => void
): () => void {
  const presenceRef = ref(realtimeDb, `user_presence/${userId}`)

  onValue(presenceRef, (snapshot) => {
    const presence = snapshot.val()
    if (presence) {
      callback(presence.online, presence.last_seen)
    }
  })

  // Return unsubscribe function
  return () => off(presenceRef)
}

// ============= CHAT METADATA =============

/**
 * Get chat participants
 */
export async function getChatParticipants(applicationId: string): Promise<string[]> {
  const participantsRef = ref(realtimeDb, `chats/${applicationId}/participants`)
  const snapshot = await get(participantsRef)

  if (!snapshot.exists()) {
    return []
  }

  return Object.keys(snapshot.val())
}

/**
 * Get last message in a chat
 */
export async function getLastMessage(applicationId: string): Promise<RealtimeLastMessage | null> {
  const lastMessageRef = ref(realtimeDb, `chats/${applicationId}/last_message`)
  const snapshot = await get(lastMessageRef)

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.val()
}

/**
 * Listen to last message changes
 */
export function onLastMessageChange(
  applicationId: string,
  callback: (lastMessage: RealtimeLastMessage | null) => void
): () => void {
  const lastMessageRef = ref(realtimeDb, `chats/${applicationId}/last_message`)

  onValue(lastMessageRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null)
  })

  // Return unsubscribe function
  return () => off(lastMessageRef)
}

/**
 * Get unread message count for a user
 */
export async function getUnreadCount(
  applicationId: string,
  userId: string
): Promise<number> {
  const messagesRef = ref(realtimeDb, `chats/${applicationId}/messages`)
  const snapshot = await get(messagesRef)

  if (!snapshot.exists()) {
    return 0
  }

  let unreadCount = 0
  snapshot.forEach((childSnapshot) => {
    const message = childSnapshot.val() as RealtimeMessage
    // Count messages sent by others that haven't been read
    if (message.sender_id !== userId && !message.read_at) {
      unreadCount++
    }
  })

  return unreadCount
}

// ============= CLEANUP =============

/**
 * Delete a chat (admin only)
 */
export async function deleteChat(applicationId: string): Promise<void> {
  const chatRef = ref(realtimeDb, `chats/${applicationId}`)
  await set(chatRef, null)
}
