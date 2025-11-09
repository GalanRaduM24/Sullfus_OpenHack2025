'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-900"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
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
            <span className="text-lg sm:text-xl font-bold text-white">RentHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-3 lg:gap-4">
            <Link href="/tenant">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-900 text-sm lg:text-base">
                Browse Properties
              </Button>
            </Link>
            <Link href="/landlord">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-900 text-sm lg:text-base">
                List Property
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-900 text-sm lg:text-base">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-white text-black hover:bg-gray-100 border-0 text-sm lg:text-base px-4 lg:px-6">
                Get started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-gray-300 hover:text-white"
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
            className="sm:hidden border-t border-gray-900 py-4 space-y-3"
          >
            <Link href="/tenant" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-900">
                Browse Properties
              </Button>
            </Link>
            <Link href="/landlord" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-900">
                List Property
              </Button>
            </Link>
            <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-900">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-white text-black">
                Get started
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
