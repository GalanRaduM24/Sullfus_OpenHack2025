'use client'

import { useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function PopulateDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePopulateData = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const functions = getFunctions()
      const populateTestData = httpsCallable(functions, 'populateTestData')
      
      console.log('Calling populateTestData function...')
      const response = await populateTestData()
      
      console.log('Function response:', response.data)
      setResult(response.data)
    } catch (err: any) {
      console.error('Error calling function:', err)
      setError(err.message || 'Failed to populate data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Populate Test Data</h1>
          <p className="text-muted-foreground">
            Add test landlord and properties to Firebase
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Data Generator</CardTitle>
            <CardDescription>
              This will create:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>1 verified landlord profile (Ion Popescu)</li>
                <li>5 property listings with various features</li>
                <li>Complete data including images, amenities, and rules</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handlePopulateData}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Populating Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Populate Test Data
                </>
              )}
            </Button>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-semibold">Success!</p>
                </div>
                <div className="text-sm text-green-600 space-y-1">
                  <p>Landlord ID: {result.landlordId}</p>
                  <p>Properties Created: {result.propertiesCount}</p>
                  <p className="text-xs mt-2">Property IDs:</p>
                  <ul className="text-xs list-disc list-inside">
                    {result.propertyIds?.map((id: string) => (
                      <li key={id} className="font-mono">{id}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  <p className="font-semibold">Error</p>
                </div>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What This Does</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Landlord Profile:</strong> Creates a verified landlord
              account with complete profile information and ID verification.
            </p>
            <p>
              <strong>Properties:</strong> Adds 5 diverse properties:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Modern 2-room apartment in Old Town (€450/month)</li>
              <li>Spacious 3-room near University (€550/month)</li>
              <li>Luxury Penthouse in Primaverii (€1200/month)</li>
              <li>Cozy Studio in Obor (€300/month)</li>
              <li>Family Apartment in Baneasa (€800/month)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
