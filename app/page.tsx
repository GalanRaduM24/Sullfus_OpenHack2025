'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { 
  ArrowRight,
  Sparkles,
  MapPin,
  Check,
  Star,
  Heart,
  Zap,
  TrendingUp,
  Users,
  Shield,
  Home as HomeIcon,
  Play,
  ChevronRight,
  Eye,
  Handshake,
  MessageCircle
} from 'lucide-react'

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0)
  const [currentHowItWorksIndex, setCurrentHowItWorksIndex] = useState(0)
  const [currentTenantLandlordIndex, setCurrentTenantLandlordIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const propertiesScrollRef = useRef<HTMLDivElement>(null)
  const howItWorksScrollRef = useRef<HTMLDivElement>(null)
  const tenantLandlordScrollRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.6], [0, 100])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroProperties.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll featured properties
  useEffect(() => {
    const interval = setInterval(() => {
      if (propertiesScrollRef.current) {
        const cardWidth = isMobile ? propertiesScrollRef.current.offsetWidth * 0.85 + 24 : 400 + 24
        const scrollPosition = currentPropertyIndex * cardWidth
        propertiesScrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
        setCurrentPropertyIndex((prev) => (prev + 1) % featuredProperties.length)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [currentPropertyIndex, isMobile])

  // Auto-scroll how it works
  useEffect(() => {
    if (isMobile && howItWorksScrollRef.current) {
      const interval = setInterval(() => {
        const cardWidth = howItWorksScrollRef.current!.offsetWidth
        const scrollPosition = currentHowItWorksIndex * cardWidth
        howItWorksScrollRef.current!.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
        setCurrentHowItWorksIndex((prev) => (prev + 1) % howItWorksSteps.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [currentHowItWorksIndex, isMobile])

  // Auto-scroll tenant/landlord cards
  useEffect(() => {
    if (isMobile && tenantLandlordScrollRef.current) {
      const interval = setInterval(() => {
        const cardWidth = tenantLandlordScrollRef.current!.offsetWidth
        const scrollPosition = currentTenantLandlordIndex * cardWidth
        tenantLandlordScrollRef.current!.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
        setCurrentTenantLandlordIndex((prev) => (prev + 1) % 2)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [currentTenantLandlordIndex, isMobile])

  // Different properties for hero vs featured section
  const heroProperties = [
    {
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      title: "Modern Loft",
      price: "$1,800",
      location: "Downtown",
    },
    {
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      title: "Cozy Studio",
      price: "$1,200",
      location: "Arts Quarter",
    },
    {
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      title: "Spacious 2BR",
      price: "$2,400",
      location: "Riverside",
    }
  ]

  const featuredProperties = [
    {
      image: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80",
      title: "Luxury Penthouse",
      price: "$3,200",
      location: "City Center",
    },
    {
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      title: "Garden Apartment",
      price: "$1,500",
      location: "Suburbs",
    },
    {
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      title: "Urban Loft",
      price: "$2,100",
      location: "Arts District",
    }
  ]

  const howItWorksSteps = [
    {
      step: "01",
      title: "Set preferences",
      description: "Tell us what you want. We'll remember.",
      icon: Sparkles,
                gradient: "from-[#2a6698] to-[#3a7db8]"
    },
    {
      step: "02",
      title: "Swipe & match",
      description: "Find properties that actually fit.",
      icon: Heart,
                gradient: "from-[#2a6698] to-[#3a7db8]"
    },
    {
      step: "03",
      title: "Chat & move in",
      description: "Connect directly. No middlemen.",
      icon: Check,
                gradient: "from-[#2a6698] to-[#3a7db8]"
    }
  ]

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      
      {/* Hero - Background Image with Overlay */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Rotating Background Images */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            {heroProperties.map((property, i) => (
              i === currentIndex && (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

        {/* Content Overlay */}
        <motion.div
          style={{ y }}
          className="relative z-20 w-full"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto text-center min-h-screen flex flex-col justify-center py-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8 lg:space-y-12"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full"
                >
                  <Zap className="w-4 h-4 text-[#2a6698]" />
                  <span className="text-sm font-medium">2,500+ renters found their place this month</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tight"
                >
                  <span className="block text-white mb-2">Rent</span>
                  <span className="block bg-gradient-to-r from-[#2a6698] via-[#3a7db8] to-[#2a6698] bg-clip-text text-transparent">
                    differently.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl sm:text-2xl md:text-3xl text-gray-200 leading-relaxed max-w-3xl mx-auto"
                >
                  The rental app that cuts through the noise.
                  <br />
                  <span className="text-white font-semibold">Real people. Real places.</span>
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                >
                  <Link href="/tenant">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto text-lg px-8 py-6 bg-[#2a6698] hover:bg-[#3a7db8] text-white rounded-full font-bold shadow-2xl"
                    >
                      Find my place
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/landlord">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-white/30 hover:border-white/50 rounded-full bg-white/5 backdrop-blur-sm text-white"
                    >
                      List property
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-wrap justify-center gap-6 pt-8"
                >
                  {[
                    { value: "2,500+", label: "Happy renters" },
                    { value: "1,200+", label: "Active listings" },
                    { value: "4.8", label: "App rating" }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#2a6698] to-[#3a7db8] bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* What We Do - Platform Explanation */}
      <section className="py-20 sm:py-32 relative bg-black z-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 lg:whitespace-nowrap"
            >
              Know who you're renting from
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed px-4"
            >
              Rently is a transparent platform where you can see who you obtain the rent from and who comes to you for rent. 
              <span className="text-white font-semibold"> No hidden identities. No surprises.</span>
            </motion.p>
          </motion.div>

          {/* Mobile: Horizontal Scroll with Auto-rotate, Desktop: Grid */}
          {isMobile ? (
            <div 
              ref={tenantLandlordScrollRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth mt-12 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12"
            >
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-shrink-0 w-[85vw] snap-center"
              >
                <div className="bg-gradient-to-br from-[#1a3d5c]/50 to-[#2a6698]/50 rounded-2xl p-6 border border-[#2a6698]/30">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2a6698] to-[#3a7db8] flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    For Tenants
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    See exactly who you're renting from. View landlord profiles, their properties, and reviews from other tenants. 
                    Make informed decisions with full transparency.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex-shrink-0 w-[85vw] snap-center"
              >
                <div className="bg-gradient-to-br from-[#1a3d5c]/50 to-[#2a6698]/50 rounded-2xl p-6 border border-[#2a6698]/30">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2a6698] to-[#3a7db8] flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    For Landlords
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    See who's interested in your properties. Review tenant profiles, their rental history, and references. 
                    Connect with quality tenants directly.
                  </p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-12 sm:mt-16 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-gradient-to-br from-[#1a3d5c]/50 to-[#2a6698]/50 rounded-3xl p-8 border border-[#2a6698]/30"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2a6698] to-[#3a7db8] flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  For Tenants
                </h3>
                <p className="text-base text-gray-300 leading-relaxed">
                  See exactly who you're renting from. View landlord profiles, their properties, and reviews from other tenants. 
                  Make informed decisions with full transparency.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-gradient-to-br from-[#1a3d5c]/50 to-[#2a6698]/50 rounded-3xl p-8 border border-[#2a6698]/30"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2a6698] to-[#3a7db8] flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  For Landlords
                </h3>
                <p className="text-base text-gray-300 leading-relaxed">
                  See who's interested in your properties. Review tenant profiles, their rental history, and references. 
                  Connect with quality tenants directly.
                </p>
              </motion.div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 sm:mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-[#1a3d5c]/30 rounded-xl sm:rounded-2xl border border-[#2a6698]/30">
              <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-[#2a6698]" />
              <span className="text-sm sm:text-lg text-gray-300">
                <span className="text-white font-semibold">Transparent connections</span> between tenants and landlords
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties - Auto-scrolling with Manual Control */}
      <section className="py-20 sm:py-32 relative bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              Featured properties
            </h2>
            <p className="text-xl text-gray-400">
              Real places. Real prices. Right now.
            </p>
          </motion.div>

          {/* Horizontal Scroll with Auto-scroll */}
          <div 
            ref={propertiesScrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12"
          >
            {featuredProperties.map((property, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
                className={`flex-shrink-0 ${isMobile ? 'w-[85vw]' : 'w-[400px]'} snap-center`}
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#2a6698] to-[#3a7db8] rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-gray-900 rounded-3xl overflow-hidden border border-gray-800">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={property.image}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 85vw, 400px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-white">{property.title}</h3>
                        <span className="text-3xl font-black bg-gradient-to-r from-[#2a6698] to-[#3a7db8] bg-clip-text text-transparent">
                          {property.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location}</span>
                      </div>
                      <Button className="w-full mt-4 bg-[#2a6698] hover:bg-[#3a7db8] text-white">
                        View details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Carousel on Mobile with Manual Control */}
      <section className="py-20 sm:py-32 relative bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-400">
              Three steps. That's it.
            </p>
          </motion.div>

          {isMobile ? (
            // Mobile: Horizontal Scroll with Auto-scroll
            <div 
              ref={howItWorksScrollRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12"
            >
              {howItWorksSteps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
                  className="flex-shrink-0 w-[85vw] snap-center"
                >
                  <div className="relative group">
                    <div className={`absolute -inset-0.5 bg-gradient-to-br ${item.gradient} rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity`} />
                    <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-800">
                      <div className="text-6xl font-black text-gray-800 mb-4">{item.step}</div>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Desktop: Grid
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {howItWorksSteps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-br ${item.gradient} rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity`} />
                  <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-800">
                    <div className="text-6xl font-black text-gray-800 mb-4">{item.step}</div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-32 relative bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">
              Ready to rent differently?
            </h2>
            <p className="text-xl sm:text-2xl text-gray-400">
              Join thousands finding their perfect match.
            </p>
            <div className="pt-4">
              <Link href="/select-role">
                <Button 
                  size="lg" 
                  className="text-xl px-12 py-8 bg-[#2a6698] hover:bg-[#3a7db8] text-white rounded-full font-bold shadow-2xl"
                >
                  Get started free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
