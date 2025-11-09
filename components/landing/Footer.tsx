import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-gray-900 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[50px] h-[50px]">
                <Image
                  src="/assets/Icon.svg"
                  alt="RentHub Logo"
                  fill
                  className="object-contain scale-150"
                  style={{ filter: 'brightness(0) saturate(100%) invert(35%) sepia(67%) saturate(1000%) hue-rotate(180deg) brightness(95%) contrast(85%)' }}
                />
              </div>
              <span className="font-bold text-base sm:text-lg text-white">RentHub</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xs">
              The simple way to connect tenants and landlords. No brokers, no BS.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">For Tenants</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li>
                <Link href="/tenant" className="hover:text-white transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/tenant/swipe" className="hover:text-white transition-colors">
                  Swipe Interface
                </Link>
              </li>
              <li>
                <Link href="/tenant/matches" className="hover:text-white transition-colors">
                  Your Matches
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">For Landlords</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li>
                <Link href="/landlord" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/landlord/listings" className="hover:text-white transition-colors">
                  List Properties
                </Link>
              </li>
              <li>
                <Link href="/landlord/tenants" className="hover:text-white transition-colors">
                  View Tenants
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-900 text-center text-xs sm:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} RentHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
