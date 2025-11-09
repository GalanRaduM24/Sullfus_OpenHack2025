'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn } from 'lucide-react'
import Link from 'next/link'

interface RequireAuthProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Component that requires authentication to show its children
 * Shows a sign in prompt if user is not authenticated
 */
export function RequireAuth({ 
  children, 
  fallback,
  redirectTo 
}: RequireAuthProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    const returnUrl = redirectTo || window.location.pathname

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Sign In Required</CardTitle>
          <CardDescription>
            Please sign in to continue with this action
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href={`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`}>
            <Button className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link href={`/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`}>
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

