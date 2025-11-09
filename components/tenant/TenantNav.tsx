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
  Sparkles,
  User,
  Bell,
  Settings
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
    { href: '/tenant', label: 'Dashboard', icon: Home, gradient: 'from-blue-500 to-cyan-500' },
    { href: '/tenant/search', label: 'Discover', icon: Search, gradient: 'from-purple-500 to-pink-500' },
    { href: '/tenant/favorites', label: 'Saved', icon: Heart, gradient: 'from-red-500 to-orange-500' },
    { href: '/tenant/applications', label: 'Applications', icon: FileText, gradient: 'from-green-500 to-emerald-500' },
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
      className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/tenant" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="relative w-8 h-8"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                RentHub
              </span>
              <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full border border-blue-500/30">
                Tenant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "relative overflow-hidden text-gray-300 hover:text-white transition-all duration-300",
                        isActive && "text-white"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 rounded-md`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.2 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white p-2"
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                    </motion.div>

                    {/* User Avatar */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border-2 border-gradient-to-r from-blue-500 to-purple-500">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300 max-w-[100px] truncate">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/signin">
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
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
              className="md:hidden border-t border-gray-800 py-4"
            >
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white transition-all rounded-lg",
                          isActive && "text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  )
                })}
                
                {!loading && (
                  <div className="pt-4 border-t border-gray-800 space-y-2">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.photoURL || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-300">
                            {user.displayName || user.email?.split('@')[0] || 'User'}
                          </span>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 transition-colors w-full text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white transition-colors">
                            <LogIn className="h-5 w-5" />
                            <span>Sign In</span>
                          </div>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mx-4">
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
    </motion.nav>
  )
}
