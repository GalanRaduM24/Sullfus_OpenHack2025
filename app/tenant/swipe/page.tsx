'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Heart, MapPin } from 'lucide-react'

export default function TenantSwipePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Discover Properties</h1>
          <p className="text-muted-foreground">
            Swipe right to like, left to pass
          </p>
        </div>
        
        <Card className="min-h-[600px] flex flex-col">
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">No properties yet</h2>
              <p className="text-muted-foreground">
                Properties will appear here for you to swipe through
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button 
            size="lg" 
            variant="destructive" 
            className="rounded-full w-16 h-16"
          >
            <X className="h-6 w-6" />
          </Button>
          <Button 
            size="lg" 
            className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
