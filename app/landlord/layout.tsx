import type { Metadata } from 'next'
import LandlordNav from '@/components/landlord/LandlordNav'

export const metadata: Metadata = {
  title: 'Landlord Dashboard - Rently',
  description: 'Manage your properties and find great tenants',
}

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

