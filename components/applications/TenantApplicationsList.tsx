'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, MapPin, Home, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Image from 'next/image'

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
    media: {
      photos: string[]
    }
    property_type: string
  } | null
  landlord: {
    id: string
    name: string
    company_name?: string
    profile_photo_url?: string
    business_verified?: boolean
  } | null
}

interface TenantApplicationsListProps {
  tenantId: string
  onOpenChat?: (applicationId: string) => void
}

export function TenantApplicationsList({ tenantId, onOpenChat }: TenantApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'chat_open' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    loadApplications()
  }, [tenantId])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/applications?tenant_id=${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
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
              <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">
                {filter === 'all' 
                  ? 'No applications yet'
                  : `No ${filter.replace('_', ' ')} applications`
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Like properties to start receiving responses from landlords
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                {application.property?.media?.photos?.[0] && (
                  <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                    <Image
                      src={application.property.media.photos[0]}
                      alt={application.property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {application.property?.title || 'Property'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.property?.address?.city}, {application.property?.address?.area}
                        </span>
                        <span className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          {application.property?.property_type}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {application.property?.price} {application.property?.currency || 'RON'}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Landlord: {application.landlord?.company_name || application.landlord?.name}
                        {application.landlord?.business_verified && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Verified
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Applied: {formatDate(application.tenant_liked_at)}
                        {application.landlord_approved_at && (
                          <> • Approved: {formatDate(application.landlord_approved_at)}</>
                        )}
                      </p>
                    </div>

                    {application.status === 'chat_open' && (
                      <Button
                        onClick={() => onOpenChat?.(application.id)}
                        className="ml-4"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Open Chat
                      </Button>
                    )}

                    {application.status === 'approved' && (
                      <div className="ml-4 text-sm text-muted-foreground">
                        <p>Waiting for mutual interest</p>
                        <p className="text-xs">Like the property to unlock chat</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
