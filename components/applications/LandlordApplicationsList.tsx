'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, MapPin, Home, Calendar, CheckCircle2, XCircle, Clock, User } from 'lucide-react'
import { SeriosityScoreBadge } from '@/components/profile/SeriosityScoreBadge'

interface Application {
  id: string
  property_id: string
  tenant_id: string
  landlord_id: string
  status: 'pending' | 'approved' | 'rejected' | 'chat_open' | 'closed'
  tenant_liked_at: any
  landlord_approved_at?: any
  created_at: any
  updated_at: any
  property: {
    id: string
    title: string
    price: number
    currency: string
    address: {
      city: string
      area: string
    }
    property_type: string
  } | null
  tenant: {
    id: string
    name: string
    age?: number
    profession?: string
    profile_photo_url?: string
    seriosity_score?: number
    verification_status?: string
  } | null
}

interface LandlordApplicationsListProps {
  landlordId: string
  propertyId?: string // Optional: filter by specific property
  onOpenChat?: (applicationId: string) => void
}

export function LandlordApplicationsList({ 
  landlordId, 
  propertyId,
  onOpenChat 
}: LandlordApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'chat_open' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    loadApplications()
  }, [landlordId])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/applications?landlord_id=${landlordId}`)
      if (response.ok) {
        const data = await response.json()
        let apps = data.applications
        
        // Filter by property if specified
        if (propertyId) {
          apps = apps.filter((app: Application) => app.property_id === propertyId)
        }
        
        setApplications(apps)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'chat_open':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Chat Open
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({applications.length})
        </Button>
        <Button
          variant={filter === 'chat_open' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('chat_open')}
        >
          Chat Open ({applications.filter(a => a.status === 'chat_open').length})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('approved')}
        >
          Approved ({applications.filter(a => a.status === 'approved').length})
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('rejected')}
        >
          Rejected ({applications.filter(a => a.status === 'rejected').length})
        </Button>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">
                {filter === 'all' 
                  ? 'No applications yet'
                  : `No ${filter.replace('_', ' ')} applications`
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Applications will appear here when tenants like your properties
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Tenant Avatar */}
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={application.tenant?.profile_photo_url} />
                    <AvatarFallback>
                      {application.tenant?.name?.charAt(0).toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Tenant Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {application.tenant?.name || 'Tenant'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {application.tenant?.age && <span>{application.tenant.age} years old</span>}
                          {application.tenant?.profession && (
                            <>
                              <span>•</span>
                              <span>{application.tenant.profession}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    {/* Seriosity Score */}
                    {application.tenant?.seriosity_score !== undefined && (
                      <div className="mb-3">
                        <SeriosityScoreBadge
                          score={application.tenant.seriosity_score}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Property Info */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium mb-1">
                        Property: {application.property?.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {application.property?.address?.city}, {application.property?.address?.area}
                        </span>
                        <span className="flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          {application.property?.property_type}
                        </span>
                        <span className="font-semibold text-primary">
                          {application.property?.price} {application.property?.currency || 'RON'}/mo
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Liked: {formatDate(application.tenant_liked_at)}
                        {application.landlord_approved_at && (
                          <> • Approved: {formatDate(application.landlord_approved_at)}</>
                        )}
                      </div>

                      {application.status === 'chat_open' && (
                        <Button
                          onClick={() => onOpenChat?.(application.id)}
                          size="sm"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Open Chat
                        </Button>
                      )}

                      {application.status === 'approved' && (
                        <div className="text-xs text-muted-foreground">
                          Waiting for tenant to like property
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
