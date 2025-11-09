# Rently – Smart Rental Matching App

A cross-platform rental matching application that helps tenants and landlords connect efficiently.

## Tech Stack

- **Frontend**: Next.js 14 (React)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Icons**: Lucide React
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions, Messaging)
- **Maps**: Google Maps API & Google Places API
- **AI**: Gemini API (Vision for ID verification, Chatbot & Video Analysis)
- **Styling**: Tailwind CSS with CSS Variables
- **Animations**: Framer Motion, Tailwind CSS Animate

## Features

### ✅ Completed
- [x] Next.js project setup with TypeScript
- [x] shadcn/ui component library integration
- [x] Tailwind CSS configuration with CSS variables
- [x] Firebase configuration and setup
- [x] Gemini API integration (Vision for ID verification)
- [x] Google Maps API integration
- [x] Dual interface structure (Tenant & Landlord)
- [x] Role-based routing and layouts
- [x] Shared Firebase functions
- [x] Authentication system (Email/Password, Google Sign In)
- [x] ID Card Verification (Romanian CNP validation)
- [x] Modern navigation components
- [x] Beautiful landing page with animations
- [x] Sign up/Sign in pages with ID verification flow

### 🚧 In Progress
- [ ] Property Listings
- [ ] Swipe/Matching System
- [ ] Chat Functionality
- [ ] Video Analysis
- [ ] Push Notifications

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
- Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Google Maps API key (get from [Google Cloud Console](https://console.cloud.google.com/))

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase and API keys:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Firebase:**
   - Go to Firebase Console > Project Settings
   - Copy your config values to `.env.local`
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Storage
   - Set up security rules (see [SETUP_ID_VERIFICATION.md](./SETUP_ID_VERIFICATION.md))

4. **Configure Google APIs:**
   - **Gemini API**: Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Google Maps**: Enable Maps JavaScript API, Places API, Geocoding API in [Google Cloud Console](https://console.cloud.google.com/)

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the landing page! 🎉

## Project Structure

```
rently/
├── app/                           # Next.js app directory
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── auth/                     # Authentication pages
│   │   ├── signin/               # Sign in page
│   │   └── signup/               # Sign up page with ID verification
│   ├── select-role/              # Role selection page
│   ├── tenant/                   # Tenant interface
│   │   ├── layout.tsx            # Tenant layout with nav
│   │   ├── page.tsx              # Tenant dashboard
│   │   ├── swipe/                # Property swipe interface
│   │   ├── matches/              # Tenant matches
│   │   └── profile/              # Tenant profile
│   ├── landlord/                 # Landlord interface
│   │   ├── layout.tsx            # Landlord layout with nav
│   │   ├── page.tsx              # Landlord dashboard
│   │   ├── listings/             # Property listings management
│   │   ├── tenants/              # Interested tenants
│   │   ├── matches/              # Landlord matches
│   │   └── profile/              # Landlord profile
│   └── globals.css               # Global styles
├── components/                    # React components
│   ├── ui/                       # shadcn/ui components
│   ├── id-verification/          # ID card upload component
│   ├── maps/                     # Google Maps components
│   ├── landing/                  # Landing page components
│   ├── tenant/                   # Tenant-specific components
│   └── landlord/                 # Landlord-specific components
├── lib/                           # Utility libraries
│   ├── firebase/                 # Firebase functions
│   │   ├── config.ts             # Firebase configuration
│   │   ├── id-verification.ts    # ID verification functions
│   │   ├── users.ts              # User management
│   │   ├── listings.ts           # Property listings
│   │   ├── matches.ts            # Matching system
│   │   └── chat.ts               # Chat/messaging
│   ├── gemini/                   # Gemini API
│   │   └── vision.ts             # Vision API for ID cards
│   ├── maps/                     # Google Maps utilities
│   │   └── google-maps.ts        # Maps helper functions
│   ├── services/                 # Service integrations
│   │   └── id-verification.service.ts  # ID verification service
│   └── utils/                    # Utility functions
│       ├── id-verification.ts    # CNP validation utilities
│       └── utils.ts              # General utilities
├── public/                        # Static assets
│   └── assets/                   # Images and icons
└── .env.example                   # Environment variables template
```

## Dual Interface Architecture

The app has **two separate interfaces** connected to the **same Firebase backend**:

### 👤 Tenant Interface (`/tenant/*`)
- **Dashboard**: Overview of tenant activity
- **Swipe**: Browse and swipe on property listings
- **Matches**: View mutual matches with landlords
- **Profile**: Manage tenant profile and preferences

### 🏢 Landlord Interface (`/landlord/*`)
- **Dashboard**: Overview of landlord activity
- **Listings**: Create and manage property listings
- **Tenants**: View interested tenant profiles
- **Matches**: View mutual matches with tenants
- **Profile**: Manage landlord profile

### 🔄 Shared Backend
Both interfaces use the same Firebase backend:
- **Firestore Collections**: `tenantProfiles`, `landlordProfiles`, `idVerifications`, `listings`, `matches`, `chats`
- **Shared Functions**: All Firebase operations in `lib/firebase/`
- **Role-based Access**: User roles determine interface access

## ID Card Verification

The app includes ID card verification for both tenants and landlords:
- **Romanian ID Card Support**: Full CNP (Personal Numeric Code) validation
- **Multi-Service OCR**: Gemini Vision API (primary), with fallback to Google Vision and PicToText
- **Data Extraction**: Name, date of birth, CNP, ID number, expiry date, nationality
- **Validation**: Age verification (18+), expiry date checking, CNP checksum validation
- **Secure Storage**: ID cards stored in Firebase Storage with user-specific paths

For detailed setup instructions, see [SETUP_ID_VERIFICATION.md](./SETUP_ID_VERIFICATION.md).

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

Create a `.env.local` file with the following variables (see `.env.example`):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Gemini API (Required for ID verification)
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key

# Google Maps API (Required)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key

# Optional: Fallback OCR services
NEXT_PUBLIC_PICTOTEXT_API_KEY=your-pictotext-key
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=your-vision-key
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture and data flow
- **[SETUP_ID_VERIFICATION.md](./SETUP_ID_VERIFICATION.md)**: Detailed ID verification setup guide

## License

Private project

---

Built with ❤️ using Next.js and Firebase
