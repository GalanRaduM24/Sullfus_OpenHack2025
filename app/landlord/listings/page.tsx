import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'

export default function LandlordListingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your property listings
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No listings yet</CardTitle>
            <CardDescription className="text-center mb-6">
              Start by adding your first property listing to attract tenants
            </CardDescription>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Listing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
