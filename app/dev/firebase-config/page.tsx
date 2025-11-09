"use client"

import { useEffect, useState } from 'react'
import app, { auth } from '@/lib/firebase/config'

export default function FirebaseConfigDebug() {
  const [options, setOptions] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      // Firebase App options (runtime)
      // @ts-ignore
      setOptions(app?.options ?? null)
    } catch (err) {
      setOptions({ error: String(err) })
    }

    try {
      setUser(auth?.currentUser ?? null)
    } catch (err) {
      setUser({ error: String(err) })
    }
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Debug</h1>
      <section className="mb-6">
        <h2 className="font-semibold">App Options</h2>
        <pre className="bg-black text-white p-4 rounded mt-2 overflow-auto">
          {JSON.stringify(options, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="font-semibold">Current Auth User</h2>
        <pre className="bg-black text-white p-4 rounded mt-2 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </section>
    </main>
  )
}
