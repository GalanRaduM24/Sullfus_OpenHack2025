'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { getTenantProfile } from '@/lib/firebase/users'
import { TenantProfile } from '@/lib/firebase/users'
import { isTenantProfileComplete } from '@/lib/utils/profile-completion'
import { TenantProfileForm } from '@/components/profile/TenantProfileForm'
import { IDVerificationPrompt } from '@/components/profile/IDVerificationPrompt'
import Link from 'next/link'
import { 
  Heart, 
  LogIn, 
  CheckCircle, 
  Search, 
  Home, 
  Euro, 
  Clock,
  Sparkles,
  Star,
  MapPin,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  ChevronRight,
  Bell,
  Bookmark,
  Eye,
  Filter,
  Zap,
  Plus,
  ArrowRight,
  Building,
  Camera,
  Bed,
  Bath
} from 'lucide-react'

// Mock data for dashboard
const mockRecentViews = [
  {
    id: '1',
    title: 'Modern Studio in Herastrau',
    location: 'Herastrau, Bucharest',
    price: 750,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    landlordRating: 4.8,
    viewedAt: '2 hours ago'
  },
  {
    id: '2',
    title: '2BR Apartment Old Town',
    location: 'Old Town, Bucharest',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    landlordRating: 4.6,
    viewedAt: '1 day ago'
  }
]

const mockRecommendations = [
  {
    id: '3',
    title: 'Cozy 1BR near Pipera',
    location: 'Pipera, Bucharest',
    price: 900,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
    landlordRating: 4.9,
    matchScore: 95,
    reasons: ['Budget match', 'Preferred area', 'Pet-friendly']
  },
  {
    id: '4',
    title: 'Luxury Studio Downtown',
    location: 'Calea Victoriei, Bucharest',
    price: 800,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    landlordRating: 4.7,
    matchScore: 88,
    reasons: ['Great reviews', 'Quick response', 'Central location']
  }
]

const mockStats = {
  totalViews: 127,
  savedProperties: 8,
  activeApplications: 2,
  messagesUnread: 3
}

export default function ModernTenantDashboard() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showIDVerification, setShowIDVerification] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfileLoading(false)
        return
      }

      try {
        const tenantProfile = await getTenantProfile(user.uid)
        setProfile(tenantProfile)
        setProfileComplete(tenantProfile ? isTenantProfileComplete(tenantProfile) : false)
      } catch (error) {
        console.error('Error loading tenant profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user])

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Rently</CardTitle>
            <CardDescription>Sign in to find your perfect home</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/signin">
              <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full rounded-xl">
                Create Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showProfileForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <TenantProfileForm userId={user?.uid || ''} onComplete={() => { setShowProfileForm(false); if (user) { getTenantProfile(user.uid).then(p => { setProfile(p); setProfileComplete(p ? isTenantProfileComplete(p) : false); }); } }}
        />
      </div>
    )
  }

  if (showIDVerification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <IDVerificationPrompt userId={user?.uid || ''} userType="tenant" onComplete={() => setShowIDVerification(false)}
          onSkip={() => setShowIDVerification(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 md:w-20 md:h-20">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {user.displayName?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Ready to find your perfect home?</p>
              {!profileComplete && (
                <Badge variant="outline" className="mt-2 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Complete your profile
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockStats.savedProperties}</div>
              <div className="text-xs text-gray-500">Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mockStats.activeApplications}</div>
              <div className="text-xs text-gray-500">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mockStats.totalViews}</div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!profileComplete && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600">Get better recommendations and build trust with landlords</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowProfileForm(true)}
                  className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Complete <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Search */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, price, or features..."
                  className="pl-10 pr-4 h-12 rounded-2xl border-gray-200 focus:border-blue-500 bg-gray-50"
                />
              </div>
              <Link href="/tenant/search">
                <Button size="lg" className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Sparkles className="mr-2 h-5 w-5" />
                  AI Search
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/tenant/search">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Explore</h3>
                <p className="text-sm text-gray-600 mt-1">Find rentals</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tenant/favorites">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform relative">
                  <Heart className="h-6 w-6 text-white" />
                  {mockStats.savedProperties > 0 && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs">
                      {mockStats.savedProperties}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">Saved</h3>
                <p className="text-sm text-gray-600 mt-1">{mockStats.savedProperties} properties</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tenant/applications">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform relative">
                  <MessageSquare className="h-6 w-6 text-white" />
                  {mockStats.activeApplications > 0 && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs">
                      {mockStats.activeApplications}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">Applications</h3>
                <p className="text-sm text-gray-600 mt-1">{mockStats.activeApplications} active</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform relative">
                <Bell className="h-6 w-6 text-white" />
                {mockStats.messagesUnread > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs">
                    {mockStats.messagesUnread}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600 mt-1">{mockStats.messagesUnread} unread</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AI Recommendations */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle>AI Recommendations</CardTitle>
                </div>
                <Link href="/tenant/search">
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Properties matched to your preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecommendations.map((property) => (
                <Link key={property.id} href={`/tenant/property/${property.id}`}>
                  <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="relative">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 text-xs px-1"
                      >
                        {property.matchScore}%
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-bold text-blue-600">€{property.price}/mo</span>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">{property.landlordRating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {property.reasons.slice(0, 2).map((reason) => (
                          <Badge key={reason} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle>Recently Viewed</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Clear All
                </Button>
              </div>
              <CardDescription>Properties you've checked out recently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentViews.map((property) => (
                <Link key={property.id} href={`/tenant/property/${property.id}`}>
                  <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-blue-600">€{property.price}/mo</span>
                        <span className="text-xs text-gray-500">{property.viewedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="rounded-full p-2">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <CardTitle>Market Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">€890</div>
                <div className="text-sm text-gray-600">Average rent in your area</div>
                <div className="text-xs text-green-600 mt-1">↗ 5% vs last month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">42</div>
                <div className="text-sm text-gray-600">New listings this week</div>
                <div className="text-xs text-blue-600 mt-1">🔥 12% more than usual</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">3.2</div>
                <div className="text-sm text-gray-600">Days average response time</div>
                <div className="text-xs text-orange-600 mt-1">⚡ Faster than last month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



