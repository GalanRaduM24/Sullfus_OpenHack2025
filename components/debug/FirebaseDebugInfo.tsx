'use client'

import { useEffect, useState } from 'react'
import { auth, storage } from '@/lib/firebase/config'
import { useAuth } from '@/contexts/AuthContext'

export function FirebaseDebugInfo() {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      auth: {
        currentUser: auth.currentUser?.uid,
        isSignedIn: !!auth.currentUser,
      },
      storage: {
        bucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId,
      },
      config: {
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      },
      user: user ? {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      } : null
    })
  }, [user])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">🔥 Firebase Debug Info</h3>
      <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  )
}