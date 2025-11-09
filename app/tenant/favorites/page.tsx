'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Star } from 'lucide-react'

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Favorites</h1>
          <p className="text-muted-foreground">
            Properties you've saved for later
          </p>
        </div>

        <Card>
          <CardContent className="pt-8">
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4">
                Start browsing properties and click the heart icon to save your favorites
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}