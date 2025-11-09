'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { 
  Filter,
  X,
  Users,
  Heart,
  Star
} from 'lucide-react'

interface TenantFilterProps {
  inquiries: any[]
  onFilteredResults: (filtered: any[]) => void
  className?: string
}

interface FilterCriteria {
  ageRange: [number, number]
  familySize: number[]
  hasChildren: boolean | null
  hasPets: boolean | null
  smokingStatus: string[]
  personality: string[]
}

const DEFAULT_FILTERS: FilterCriteria = {
  ageRange: [18, 65],
  familySize: [],
  hasChildren: null,
  hasPets: null,
  smokingStatus: [],
  personality: []
}

const SMOKING_OPTIONS = [
  { value: 'non-smoker', label: 'Non-smoker', icon: '🚭' },
  { value: 'smoker', label: 'Smoker', icon: '🚬' },
  { value: 'occasional', label: 'Occasional', icon: '🟡' }
]

const PERSONALITY_TRAITS = [
  'responsible', 'quiet', 'social', 'organized', 'professional', 
  'creative', 'respectful', 'clean', 'pet-lover', 'family-oriented'
]

export default function TenantFilter({ inquiries, onFilteredResults, className = '' }: TenantFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterCriteria>(DEFAULT_FILTERS)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const applyFilters = () => {
    const filtered = inquiries.filter(inquiry => {
      // Age range
      if (inquiry.tenantProfile.age < filters.ageRange[0] || 
          inquiry.tenantProfile.age > filters.ageRange[1]) {
        return false
      }

      // Family size
      if (filters.familySize.length > 0 && !filters.familySize.includes(inquiry.familySize)) {
        return false
      }

      // Has children
      if (filters.hasChildren !== null && inquiry.hasChildren !== filters.hasChildren) {
        return false
      }

      // Has pets
      if (filters.hasPets !== null && inquiry.hasPets !== filters.hasPets) {
        return false
      }

      // Smoking status
      if (filters.smokingStatus.length > 0 && 
          !filters.smokingStatus.includes(inquiry.tenantProfile.smokingStatus)) {
        return false
      }

      // Personality traits
      if (filters.personality.length > 0 && 
          !filters.personality.some(trait => 
            inquiry.tenantProfile.personality.includes(trait)
          )) {
        return false
      }

      return true
    })

    onFilteredResults(filtered)
    updateActiveFiltersCount()
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    onFilteredResults(inquiries)
    setActiveFiltersCount(0)
  }

  const updateActiveFiltersCount = () => {
    let count = 0
    if (filters.ageRange[0] > 18 || filters.ageRange[1] < 65) count++
    if (filters.familySize.length > 0) count++
    if (filters.hasChildren !== null) count++
    if (filters.hasPets !== null) count++
    if (filters.smokingStatus.length > 0) count++
    if (filters.personality.length > 0) count++
    setActiveFiltersCount(count)
  }

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={className}>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
      >
        <Filter className="mr-2 h-4 w-4" />
        Advanced Filters
        {activeFiltersCount > 0 && (
          <Badge className="ml-2 bg-blue-600 text-white">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Filter Tenant Inquiries</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demographics */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Age Range</Label>
                        <div className="px-2 py-4">
                          <Slider
                            value={filters.ageRange}
                            onValueChange={(value) => updateFilter('ageRange', value)}
                            max={65}
                            min={18}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-400 mt-1">
                            <span>{filters.ageRange[0]} years</span>
                            <span>{filters.ageRange[1]} years</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300">Family Size</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((size) => (
                            <Button
                              key={size}
                              variant={filters.familySize.includes(size) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newSizes = filters.familySize.includes(size)
                                  ? filters.familySize.filter(s => s !== size)
                                  : [...filters.familySize, size]
                                updateFilter('familySize', newSizes)
                              }}
                              className={`${
                                filters.familySize.includes(size)
                                  ? 'bg-blue-600 text-white'
                                  : 'border-gray-600 text-gray-300'
                              }`}
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasChildren"
                            checked={filters.hasChildren === true}
                            onCheckedChange={(checked) => 
                              updateFilter('hasChildren', checked ? true : null)
                            }
                          />
                          <label htmlFor="hasChildren" className="text-gray-300 text-sm">
                            Has children
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasPets"
                            checked={filters.hasPets === true}
                            onCheckedChange={(checked) => 
                              updateFilter('hasPets', checked ? true : null)
                            }
                          />
                          <label htmlFor="hasPets" className="text-gray-300 text-sm">
                            Has pets
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lifestyle */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Lifestyle
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label className="text-gray-300">Smoking Status</Label>
                        <div className="space-y-2 mt-2">
                          {SMOKING_OPTIONS.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`smoking-${option.value}`}
                                checked={filters.smokingStatus.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const newStatus = checked
                                    ? [...filters.smokingStatus, option.value]
                                    : filters.smokingStatus.filter(s => s !== option.value)
                                  updateFilter('smokingStatus', newStatus)
                                }}
                              />
                              <label htmlFor={`smoking-${option.value}`} className="text-gray-300 text-sm">
                                {option.icon} {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personality */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Personality
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label className="text-gray-300">Desired Traits</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {PERSONALITY_TRAITS.map((trait) => (
                            <div key={trait} className="flex items-center space-x-2">
                              <Checkbox
                                id={`trait-${trait}`}
                                checked={filters.personality.includes(trait)}
                                onCheckedChange={(checked) => {
                                  const newTraits = checked
                                    ? [...filters.personality, trait]
                                    : filters.personality.filter(t => t !== trait)
                                  updateFilter('personality', newTraits)
                                }}
                              />
                              <label htmlFor={`trait-${trait}`} className="text-gray-300 text-xs">
                                {trait}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator className="bg-gray-700 my-6" />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing results based on {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="border-gray-600 text-gray-300"
                    >
                      Reset All
                    </Button>
                    <Button
                      onClick={() => {
                        applyFilters()
                        setIsOpen(false)
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}