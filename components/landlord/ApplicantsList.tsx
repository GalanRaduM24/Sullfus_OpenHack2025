'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ApplicantInfo } from '@/lib/firebase/types'
import { SeriosityScoreBadge } from '@/components/profile/SeriosityScoreBadge'
import { ScoreBreakdownModal } from '@/components/profile/ScoreBreakdownModal'
import { User, Briefcase, Calendar, FileText, Lock } from 'lucide-react'
import { ApprovalButton } from './ApprovalButton'

interface ApplicantsListProps {
  propertyId: string
  landlordId: string
  canViewScore: boolean
  canViewBreakdown: boolean
  canViewDocuments: boolean
  onApprovalSuccess?: () => void
}

export function ApplicantsList({
  propertyId,
  landlordId,
  canViewScore,
  canViewBreakdown,
  canViewDocuments,
  onApprovalSuccess
}: ApplicantsListProps) {
  const [applicants, setApplicants] = useState<ApplicantInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantInfo | null>(null)
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)

  useEffect(() => {
    loadApplicants()
  }, [propertyId, landlordId])

  const loadApplicants = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/properties/${propertyId}/applicants?landlord_id=${landlordId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load applicants')
      }

      const data = await response.json()
      setApplicants(data.applicants || [])
    } catch (err) {
      console.error('Error loading applicants:', err)
      setError(err instanceof Error ? err.message : 'Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovalSuccess = () => {
    // Reload applicants list
    loadApplicants()
    if (onApprovalSuccess) {
      onApprovalSuccess()
    }
  }

  const handleViewScore = (applicant: ApplicantInfo) => {
    if (canViewBreakdown) {
      setSelectedApplicant(applicant)
      setShowScoreBreakdown(true)
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'interview_verified':
        return <Badge variant="default" className="bg-green-500">Interview Verified</Badge>
      case 'id_verified':
        return <Badge variant="secondary">ID Verified</Badge>
      case 'unverified':
        return <Badge variant="outline">Unverified</Badge>
      default:
        return null
    }
  }

  const getApplicationStatusBadge = (status?: string) => {
    if (!status) return null
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-blue-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'chat_open':
        return <Badge variant="default" className="bg-green-500">Chat Open</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applicants</CardTitle>
          <CardDescription>Loading applicants...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applicants</CardTitle>
          <CardDescription>Error loading applicants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadApplicants} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (applicants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applicants</CardTitle>
          <CardDescription>No applicants yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No tenants have liked this property yet
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Applicants ({applicants.length})</CardTitle>
          <CardDescription>
            Tenants who have liked this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <Card key={applicant.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={applicant.profile_photo_url} alt={applicant.name} />
                      <AvatarFallback>
                        {applicant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{applicant.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getVerificationBadge(applicant.verification_status)}
                            {getApplicationStatusBadge(applicant.application_status)}
                          </div>
                        </div>

                        {canViewScore && (
                          <div className="cursor-pointer" onClick={() => handleViewScore(applicant)}>
                            <SeriosityScoreBadge 
                              score={applicant.seriosity_score}
                            />
                          </div>
                        )}

                        {!canViewScore && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span className="text-sm">Upgrade to view score</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{applicant.age} years old</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{applicant.profession}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Liked {new Date(applicant.liked_at.toDate()).toLocaleDateString()}</span>
                        </div>
                        {canViewDocuments && applicant.documents && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {(applicant.documents.income_proof?.length || 0) + 
                               (applicant.documents.references?.length || 0)} documents
                            </span>
                          </div>
                        )}
                      </div>

                      {applicant.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {applicant.bio}
                        </p>
                      )}

                      {(!applicant.application_status || applicant.application_status === 'pending') && (
                        <div className="flex gap-2 pt-2">
                          <ApprovalButton
                            propertyId={propertyId}
                            tenantId={applicant.id}
                            landlordId={landlordId}
                            action="approve"
                            onSuccess={handleApprovalSuccess}
                            className="flex-1"
                          />
                          <ApprovalButton
                            propertyId={propertyId}
                            tenantId={applicant.id}
                            landlordId={landlordId}
                            action="reject"
                            onSuccess={handleApprovalSuccess}
                            className="flex-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedApplicant && canViewBreakdown && selectedApplicant.seriosity_breakdown && (
        <ScoreBreakdownModal
          isOpen={showScoreBreakdown}
          onClose={() => setShowScoreBreakdown(false)}
          score={selectedApplicant.seriosity_score}
          breakdown={selectedApplicant.seriosity_breakdown}
        />
      )}
    </>
  )
}
