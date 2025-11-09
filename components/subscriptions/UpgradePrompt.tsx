'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Sparkles, TrendingUp, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
  requiredTier: 'pro' | 'business'
  description?: string
  inline?: boolean
}

const TIER_INFO = {
  pro: {
    name: 'Pro',
    price: '€14.99/month',
    color: 'bg-blue-500',
    icon: TrendingUp,
    features: [
      'View Seriosity Scores',
      'Access score breakdowns',
      'View tenant documents',
      'Filter by score',
      'Up to 5 listings'
    ]
  },
  business: {
    name: 'Business',
    price: '€99.99/month',
    color: 'bg-purple-500',
    icon: BarChart3,
    features: [
      'All Pro features',
      'Unlimited listings',
      'Advanced analytics',
      'CSV export',
      'Priority support'
    ]
  }
}

export function UpgradePrompt({ 
  feature, 
  requiredTier, 
  description,
  inline = false 
}: UpgradePromptProps) {
  const tierInfo = TIER_INFO[requiredTier]
  const Icon = tierInfo.icon

  if (inline) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-muted">
        <Lock className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {feature} requires {tierInfo.name}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Link href="/landlord/subscription">
          <Button size="sm" className={tierInfo.color}>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${tierInfo.color} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Unlock {feature}
              <Badge className={tierInfo.color}>{tierInfo.name}</Badge>
            </CardTitle>
            <CardDescription>
              {description || `Upgrade to ${tierInfo.name} to access this feature`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">What you'll get:</p>
          <ul className="space-y-2">
            {tierInfo.features.map((feat, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className={`h-1.5 w-1.5 rounded-full ${tierInfo.color}`} />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-2xl font-bold">{tierInfo.price}</p>
            <p className="text-xs text-muted-foreground">Cancel anytime</p>
          </div>
          <Link href="/landlord/subscription">
            <Button size="lg" className={tierInfo.color}>
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to {tierInfo.name}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
