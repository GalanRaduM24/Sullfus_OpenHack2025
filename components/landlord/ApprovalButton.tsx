'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ApprovalButtonProps {
  propertyId: string
  tenantId: string
  landlordId: string
  action: 'approve' | 'reject'
  onSuccess?: (chatUnlocked?: boolean) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
}

export function ApprovalButton({
  propertyId,
  tenantId,
  landlordId,
  action,
  onSuccess,
  onError,
  disabled = false,
  className
}: ApprovalButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAction = async () => {
    try {
      setLoading(true)

      const endpoint = `/api/properties/${propertyId}/applicants/${tenantId}/${action}`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landlord_id: landlordId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} applicant`)
      }

      // Show success message
      if (action === 'approve') {
        if (data.chat_unlocked) {
          toast({
            title: 'Applicant Approved!',
            description: 'Chat is now unlocked. You can start messaging this tenant.',
            variant: 'default'
          })
        } else {
          toast({
            title: 'Applicant Approved',
            description: 'The tenant will be notified. Chat will unlock when they like your property.',
            variant: 'default'
          })
        }
      } else {
        toast({
          title: 'Applicant Rejected',
          description: 'The tenant has been notified.',
          variant: 'default'
        })
      }

      if (onSuccess) {
        onSuccess(data.chat_unlocked)
      }

    } catch (error) {
      console.error(`Error ${action}ing applicant:`, error)
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} applicant`
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })

      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  if (action === 'approve') {
    return (
      <Button
        onClick={handleAction}
        disabled={disabled || loading}
        className={className}
        variant="default"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Approving...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleAction}
      disabled={disabled || loading}
      className={className}
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Rejecting...
        </>
      ) : (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </>
      )}
    </Button>
  )
}
