import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

export default function LandlordTenantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interested Tenants</h1>
          <p className="text-muted-foreground">
            View tenants who are interested in your properties
          </p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No interested tenants yet</CardTitle>
            <CardDescription className="text-center mb-6">
              Tenants who like your properties will appear here
            </CardDescription>
            <Button variant="outline">
              View Your Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
