'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'tenant' | 'landlord'
}

/**
 * Protects a route by requiring authentication and (optionally) a role.
 * If `requiredRole` is provided, the user's Firestore `users/{uid}` doc is read
 * to verify the `activeRoles` array contains that role. If not, user is redirected
 * to `/select-role`.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [roleCheckLoading, setRoleCheckLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  useEffect(() => {
    let mounted = true

    const checkRole = async () => {
      if (!requiredRole || !user) return

      setRoleCheckLoading(true)
      try {
        const userRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userRef)
        if (!mounted) return

        if (!snap.exists()) {
          // No user doc yet - redirect to select-role to finish profile
          router.push('/select-role')
          return
        }

        const data = snap.data() as any
        const roles: string[] = data.activeRoles || []

        if (!roles.includes(requiredRole)) {
          // If user has other role(s), redirect to their first role, else ask to select a role
          if (roles.length > 0) {
            router.push(`/${roles[0]}`)
          } else {
            router.push('/select-role')
          }
        }
      } catch (err) {
        console.error('Error checking user role:', err)
        router.push('/select-role')
      } finally {
        if (mounted) setRoleCheckLoading(false)
      }
    }

    checkRole()

    return () => {
      mounted = false
    }
  }, [requiredRole, user, router, loading])

  if (loading || roleCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

