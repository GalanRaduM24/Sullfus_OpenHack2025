'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Heart, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TenantNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/tenant', label: 'Home', icon: Home },
    { href: '/tenant/swipe', label: 'Swipe', icon: Heart },
    { href: '/tenant/matches', label: 'Matches', icon: MessageSquare },
    { href: '/tenant/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/tenant" className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Rently</span>
            <span className="text-sm text-muted-foreground">Tenant</span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
