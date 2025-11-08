import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function LandlordMatchesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Matches</h1>
          <p className="text-muted-foreground">
            Connect with tenants who matched with your properties
          </p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No matches yet</CardTitle>
            <CardDescription className="text-center mb-6">
              Start reviewing interested tenants to get matches!
            </CardDescription>
            <Button asChild>
              <Link href="/landlord/tenants">View Interested Tenants</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
