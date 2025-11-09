// Shared Firebase functions for chat/messaging
// Used by both tenant and landlord interfaces

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from './config'

export interface Message {
  id?: string
  matchId: string
  senderId: string
  receiverId: string
  text: string
  createdAt?: any
  read: boolean
}

/**
 * Send a message in a chat
 */
export async function sendMessage(
  matchId: string,
  senderId: string,
  receiverId: string,
  text: string
): Promise<string> {
  try {
    const messagesRef = collection(db, 'chats', matchId, 'messages')
    const docRef = await addDoc(messagesRef, {
      senderId,
      receiverId,
      text,
      read: false,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Get messages for a chat
 */
export async function getMessages(matchId: string): Promise<Message[]> {
  try {
    const messagesRef = collection(db, 'chats', matchId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[]
  } catch (error) {
    console.error('Error getting messages:', error)
    throw error
  }
}

/**
 * Subscribe to messages in real-time
 */
export function subscribeToMessages(
  matchId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const messagesRef = collection(db, 'chats', matchId, 'messages')
  const q = query(messagesRef, orderBy('createdAt', 'asc'))
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[]
    callback(messages)
  })
}

