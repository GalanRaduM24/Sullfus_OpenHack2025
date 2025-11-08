import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, MessageSquare, Settings, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function TenantDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Welcome, Tenant! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Start browsing properties and find your perfect home
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Browse Properties</CardTitle>
              </div>
              <CardDescription>
                Swipe through available listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tenant/swipe">
                <Button className="w-full" variant="outline">
                  Start Browsing
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
                <CardTitle>Matches</CardTitle>
              </div>
              <CardDescription>
                View your mutual matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tenant/matches">
                <Button className="w-full" variant="outline">
                  View Matches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Preferences</CardTitle>
              </div>
              <CardDescription>
                Set your search filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tenant/profile">
                <Button className="w-full" variant="outline">
                  Manage Preferences
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
                  <h3 className="font-semibold text-lg mb-1">Complete Your Profile</h3>
                  <p className="text-muted-foreground">Add your preferences, budget, and location preferences to get better matches</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Start Swiping</h3>
                  <p className="text-muted-foreground">Browse properties that match your criteria and swipe right on ones you like</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Chat with Landlords</h3>
                  <p className="text-muted-foreground">Connect with landlords when you have a mutual match and start the conversation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
