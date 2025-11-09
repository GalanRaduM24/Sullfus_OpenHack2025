'use client'

import LandlordNav from '@/components/landlord/LandlordNav'

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <LandlordNav />
      <main className="pb-20">
        {children}
      </main>
    </div>
  )
}

