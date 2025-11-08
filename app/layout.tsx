import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rently - Smart Rental Matching',
  description: 'Connect tenants and landlords efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

