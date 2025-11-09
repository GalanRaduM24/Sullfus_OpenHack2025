'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Home, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Search, 
  Heart, 
  FileText, 
  Menu, 
  X,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function TenantNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/tenant', label: 'Dashboard', icon: Home },
    { href: '/tenant/search', label: 'Discover', icon: Search },
    { href: '/tenant/favorites', label: 'Saved', icon: Heart },
    { href: '/tenant/applications', label: 'Applications', icon: FileText },
    { href: '/tenant/profile', label: 'Profile', icon: User },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/tenant" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative w-[40px] h-[40px]"
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
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">
                RentHub
              </span>
              <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-600/30">
                Tenant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors",
                      isActive && "bg-white text-black hover:bg-white hover:text-black"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-800">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300 max-w-[100px] truncate">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/signin">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-900 py-4"
            >
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors rounded-lg",
                          isActive && "bg-white text-black hover:bg-white hover:text-black"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  )
                })}
                
                {!loading && (
                  <div className="pt-4 border-t border-gray-900 space-y-1 mt-2">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 rounded-lg mx-2">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={user.photoURL || undefined} />
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-300">
                            {user.displayName || user.email?.split('@')[0] || 'User'}
                          </span>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors w-full text-left rounded-lg"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors rounded-lg">
                            <LogIn className="h-5 w-5" />
                            <span>Sign In</span>
                          </div>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg mx-2">
                            <UserPlus className="h-5 w-5" />
                            <span>Get Started</span>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
