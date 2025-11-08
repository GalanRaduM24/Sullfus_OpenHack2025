import type { Metadata } from 'next'
import TenantNav from '@/components/tenant/TenantNav'

export const metadata: Metadata = {
  title: 'Tenant Dashboard - Rently',
  description: 'Browse properties and find your perfect home',
}

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TenantNav />
      <main className="pb-20">
        {children}
      </main>
    </div>
  )
}

