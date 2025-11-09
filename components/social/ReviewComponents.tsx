'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  Shield,
  ThumbsUp,
  Flag,
  MessageSquare,
  Send,
  Heart,
  Award,
  TrendingUp
} from 'lucide-react'

interface ReviewData {
  id: string
  tenantName: string
  tenantAvatar: string
  rating: number
  comment: string
  date: string
  verified: boolean
  helpfulCount: number
  stayDuration: string
  aspects: {
    cleanliness: number
    communication: number
    accuracy: number
    value: number
    location: number
    checkIn: number
  }
}

interface ReviewCardProps {
  review: ReviewData
  onHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
  showDetailed?: boolean
}

export function ReviewCard({ 
  review, 
  onHelpful, 
  onReport, 
  showDetailed = false 
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false)

  const handleHelpful = () => {
    setIsHelpful(!isHelpful)
    onHelpful?.(review.id)
  }

  return (
    <Card className="border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={review.tenantAvatar} />
            <AvatarFallback>{review.tenantName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{review.tenantName}</h4>
                  {review.verified && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Stayed {review.stayDuration}</span>
                  <span>•</span>
                  <span>{review.date}</span>
                </div>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < review.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
                <span className="ml-1 text-sm font-medium">{review.rating}</span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
            
            {showDetailed && (
              <>
                {/* Review Aspects */}
                <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  {Object.entries(review.aspects).map(([aspect, rating]) => (
                    <div key={aspect} className="text-center">
                      <div className="text-sm font-medium text-gray-900">{rating}/5</div>
                      <div className="text-xs text-gray-500 capitalize">{aspect}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs ${isHelpful ? 'text-blue-600' : 'text-gray-600'}`}
                onClick={handleHelpful}
              >
                <ThumbsUp className={`h-3 w-3 mr-1 ${isHelpful ? 'fill-current' : ''}`} />
                Helpful ({review.helpfulCount + (isHelpful ? 1 : 0)})
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-red-500 hover:text-red-600"
                onClick={() => onReport?.(review.id)}
              >
                <Flag className="h-3 w-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface WriteReviewProps {
  onSubmit: (reviewData: Partial<ReviewData>) => void
  landlordName: string
}

export function WriteReview({ onSubmit, landlordName }: WriteReviewProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [aspects, setAspects] = useState({
    cleanliness: 0,
    communication: 0,
    accuracy: 0,
    value: 0,
    location: 0,
    checkIn: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAspectRating = (aspect: string, newRating: number) => {
    setAspects(prev => ({
      ...prev,
      [aspect]: newRating
    }))
  }

  const handleSubmit = async () => {
    if (rating === 0 || comment.trim() === '') return

    setIsSubmitting(true)
    
    const reviewData = {
      rating,
      comment: comment.trim(),
      aspects,
      date: new Date().toISOString().split('T')[0]
    }

    await onSubmit(reviewData)
    
    // Reset form
    setRating(0)
    setComment('')
    setAspects({
      cleanliness: 0,
      communication: 0,
      accuracy: 0,
      value: 0,
      location: 0,
      checkIn: 0
    })
    setIsSubmitting(false)
  }

  return (
    <Card className="border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Write a Review for {landlordName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Overall Rating</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-colors"
              >
                <Star 
                  className={`h-8 w-8 ${
                    star <= rating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300 hover:text-yellow-200'
                  }`} 
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 && (
                rating === 5 ? 'Excellent' :
                rating === 4 ? 'Very Good' :
                rating === 3 ? 'Good' :
                rating === 2 ? 'Fair' : 'Poor'
              )}
            </span>
          </div>
        </div>

        {/* Detailed Aspects */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Rate Different Aspects</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(aspects).map(([aspect, currentRating]) => (
              <div key={aspect} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-700">{aspect}</span>
                  <span className="text-xs text-gray-500">{currentRating}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleAspectRating(aspect, star)}
                      className="transition-colors"
                    >
                      <Star 
                        className={`h-4 w-4 ${
                          star <= currentRating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300 hover:text-yellow-200'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Written Review */}
        <div>
          <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
            Your Experience
          </Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this landlord and property. What made your stay great or what could be improved?"
            className="min-h-[120px] resize-none"
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1">
            {comment.length}/1000 characters
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || comment.trim() === '' || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ReviewStatsProps {
  overallRating: number
  totalReviews: number
  ratingBreakdown: { [key: number]: number }
  aspectAverages?: { [key: string]: number }
}

export function ReviewStats({ 
  overallRating, 
  totalReviews, 
  ratingBreakdown,
  aspectAverages 
}: ReviewStatsProps) {
  return (
    <Card className="border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            Reviews ({totalReviews})
          </CardTitle>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{overallRating}</div>
            <div className="text-sm text-gray-500">out of 5</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Rating Distribution</h4>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm w-4">{rating}</span>
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${ratingBreakdown[rating] || 0}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right">
                {ratingBreakdown[rating] || 0}%
              </span>
            </div>
          ))}
        </div>

        {aspectAverages && (
          <>
            <Separator />
            {/* Aspect Averages */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Aspect Ratings</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(aspectAverages).map(([aspect, average]) => (
                  <div key={aspect} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm capitalize text-gray-700">{aspect}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{average.toFixed(1)}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Trust Indicators */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Trust & Safety</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
            <div>✓ Identity verified reviews</div>
            <div>✓ Spam detection active</div>
            <div>✓ Fake review filtering</div>
            <div>✓ Moderated content</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}