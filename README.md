# Rently – Smart Rental Matching App

A cross-platform rental matching application that helps tenants and landlords connect efficiently.

## Tech Stack

- **Frontend**: Next.js 14 (React)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Icons**: Lucide React
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions, Messaging)
- **Maps**: Google Maps API & Google Places API
- **AI**: Gemini API (Chatbot & Video Analysis)
- **Styling**: Tailwind CSS with CSS Variables
- **Animations**: Framer Motion, Tailwind CSS Animate

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
   - Copy `env.example` to `.env.local`
   - Fill in your Firebase and API keys:
   ```bash
   cp env.example .env.local
   ```

3. **Configure Firebase:**
   - Go to Firebase Console > Project Settings
   - Copy your config values to `.env.local`
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Storage

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the welcome page! 🎉

## Project Structure

```
rently/
├── app/                           # Next.js app directory
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
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
│   ├── tenant/                   # Tenant-specific components
│   │   └── TenantNav.tsx         # Tenant navigation
│   └── landlord/                 # Landlord-specific components
│       └── LandlordNav.tsx       # Landlord navigation
├── firebase/                      # Firebase configuration
│   └── config.ts                 # Firebase init & exports
├── lib/                           # Utility libraries
│   ├── gemini.ts                 # Gemini API functions
│   └── firebase/                 # Shared Firebase functions
│       ├── users.ts              # User management
│       ├── listings.ts           # Property listings
│       ├── matches.ts            # Matching system
│       └── chat.ts               # Chat/messaging
├── public/                        # Static assets
└── env.example                    # Environment variables template
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
- **Firestore Collections**: `users`, `listings`, `matches`, `chats`
- **Shared Functions**: All Firebase operations in `lib/firebase/`
- **Role-based Access**: User roles determine interface access

## Features (MVP - To Be Implemented)

### ✅ Completed
- [x] Next.js project setup
- [x] shadcn/ui component library integration
- [x] Tailwind CSS configuration with CSS variables
- [x] Firebase configuration structure
- [x] Gemini API setup structure
- [x] Dual interface structure (Tenant & Landlord)
- [x] Role-based routing and layouts
- [x] Shared Firebase functions
- [x] Modern navigation components with shadcn/ui
- [x] Beautiful dashboard pages with shadcn/ui components
- [x] Improved UI/UX with consistent design system

### 🚧 In Progress
- [ ] Authentication (Firebase Auth)
- [ ] Profile Management (Tenant/Landlord roles)
- [ ] Property Listings
- [ ] Swipe/Matching System
- [ ] Chat Functionality
- [ ] Google Maps Integration
- [ ] Gemini Chatbot
- [ ] Video Analysis
- [ ] Push Notifications

## Next Steps

1. **Set up Firebase:**
   - Create a Firebase project
   - Enable Authentication (Email/Password, Google)
   - Create Firestore database
   - Enable Storage

2. **Configure API Keys:**
   - Add Firebase config to `.env.local`
   - Add Gemini API key
   - Add Google Maps API key

3. **Build Authentication:**
   - Login/Register pages
   - Profile setup (Tenant/Landlord selection)
   - Protected routes

4. **Implement Core Features:**
   - Property listings CRUD
   - Swipe interface
   - Chat system
   - Maps integration

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

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
```

## License

Private project

---

Built with ❤️ using Next.js and Firebase
