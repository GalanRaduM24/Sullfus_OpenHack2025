import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, User } from 'lucide-react'

export default function TenantMatchesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Matches</h1>
          <p className="text-muted-foreground">
            Connect with landlords who liked your profile
          </p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No matches yet</CardTitle>
            <CardDescription className="text-center mb-6">
              Start swiping on properties to get matches with landlords!
            </CardDescription>
            <Button asChild>
              <a href="/tenant/swipe">Start Swiping</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
