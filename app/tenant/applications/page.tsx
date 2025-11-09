'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, CheckCircle, X } from 'lucide-react'

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Applications</h1>
          <p className="text-muted-foreground">
            Track your rental applications and their status
          </p>
        </div>

        <Card>
          <CardContent className="pt-8">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">
                When you apply for properties, you'll see the status here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}