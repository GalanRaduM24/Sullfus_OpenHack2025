'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Building2, LogOut, LogIn, User, UserPlus, Home, Plus, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function LandlordNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/landlord', label: 'Dashboard', icon: Building2 },
    { href: '/landlord/properties', label: 'Properties', icon: Home },
    { href: '/landlord/add-property', label: 'Add Property', icon: Plus },
    { href: '/landlord/profile', label: 'Profile', icon: User },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-gray-900"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/landlord" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="relative w-[50px] h-[50px]"
            >
              <Image
                src="/assets/Icon.svg"
                alt="RentHub Logo"
                fill
                className="object-contain scale-150"
                style={{ filter: 'brightness(0) saturate(100%) invert(35%) sepia(67%) saturate(1000%) hue-rotate(180deg) brightness(95%) contrast(85%)' }}
                priority
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-white">RentHub</span>
              <span className="text-xs text-gray-400 hidden sm:block">Landlord Portal</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-gray-300 hover:text-white hover:bg-gray-900",
                      isActive && 'bg-white text-black hover:bg-gray-100 hover:text-black'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            {!loading && (
              <>
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-white hover:bg-gray-900"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-900">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-900 py-4 space-y-2"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-900",
                      isActive && 'bg-white text-black hover:bg-gray-100 hover:text-black'
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            {!loading && (
              <>
                {user ? (
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-900"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-900">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-white text-black hover:bg-gray-100">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
