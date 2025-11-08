import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LandlordDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Welcome, Landlord! 🏢</h1>
          <p className="text-muted-foreground text-lg">
            Manage your properties and find great tenants
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>List Properties</CardTitle>
              </div>
              <CardDescription>
                Add new property listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/landlord/listings">
                <Button className="w-full" variant="outline">
                  Manage Listings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interested Tenants</CardTitle>
              </div>
              <CardDescription>
                View tenant profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/landlord/tenants">
                <Button className="w-full" variant="outline">
                  View Tenants
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Messages</CardTitle>
              </div>
              <CardDescription>
                Chat with matched tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/landlord/matches">
                <Button className="w-full" variant="outline">
                  View Messages
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Getting Started</span>
            </CardTitle>
            <CardDescription>
              Follow these steps to get the most out of Rently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Create Your Profile</h3>
                  <p className="text-muted-foreground">Add your contact information and description to help tenants get to know you</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">List Your Properties</h3>
                  <p className="text-muted-foreground">Add photos, price, and property details to attract the right tenants</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Review Interested Tenants</h3>
                  <p className="text-muted-foreground">Swipe through tenant profiles and find matches to start conversations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
