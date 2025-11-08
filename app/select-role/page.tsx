'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Building2, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | null>(null)
  const router = useRouter()

  const handleRoleSelection = (role: 'tenant' | 'landlord') => {
    setSelectedRole(role)
    // TODO: Save role to Firebase user profile
    // For now, just navigate to the respective interface
    router.push(`/${role}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="text-center space-y-8 max-w-4xl w-full">
        <div>
          <h1 className="text-5xl font-bold mb-4">Choose Your Role</h1>
          <p className="text-xl text-muted-foreground">
            Select how you want to use Rently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Tenant Card */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === 'tenant'
                ? 'ring-2 ring-primary shadow-lg scale-105'
                : 'hover:shadow-lg hover:border-primary/50'
            }`}
            onClick={() => handleRoleSelection('tenant')}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className={`p-4 rounded-full ${
                  selectedRole === 'tenant' ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <User className={`h-12 w-12 ${
                    selectedRole === 'tenant' ? 'text-white' : 'text-primary'
                  }`} />
                </div>
              </div>
              <CardTitle className="text-3xl text-center">I'm a Tenant</CardTitle>
              <CardDescription className="text-center text-base">
                Looking for a place to rent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Browse available properties</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Swipe through listings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Chat with landlords</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Upload intro video</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRoleSelection('tenant')
                }}
              >
                Continue as Tenant
              </Button>
            </CardContent>
          </Card>

          {/* Landlord Card */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === 'landlord'
                ? 'ring-2 ring-primary shadow-lg scale-105'
                : 'hover:shadow-lg hover:border-primary/50'
            }`}
            onClick={() => handleRoleSelection('landlord')}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className={`p-4 rounded-full ${
                  selectedRole === 'landlord' ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <Building2 className={`h-12 w-12 ${
                    selectedRole === 'landlord' ? 'text-white' : 'text-primary'
                  }`} />
                </div>
              </div>
              <CardTitle className="text-3xl text-center">I'm a Landlord</CardTitle>
              <CardDescription className="text-center text-base">
                Looking to rent out my property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>List your properties</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>View interested tenants</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Manage listings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Chat with tenants</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRoleSelection('landlord')
                }}
              >
                Continue as Landlord
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
