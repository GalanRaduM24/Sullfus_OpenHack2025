# Rently: Smart Rental Matching & Automated Verification Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20React-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase%20Suite-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20Vision-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS%20%2B%20shadcn%2Fui-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, full-stack rental marketplace connecting tenants and property owners through real-time swipe matching, AI-powered identity verification with Romanian CNP checksum validation (Google Gemini Vision OCR), and integrated Google Maps geolocation discovery.

---

## Architecture Overview

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                             Client Web Layer                             │
│  • Next.js 14 App Router, TypeScript, shadcn/ui & Framer Motion          │
│  ┌─────────────────────────────┐    ┌──────────────────────────────────┐ │
│  │ Tenant Portal (/tenant/*)   │    │ Landlord Portal (/landlord/*)    │ │
│  │ • Swipe Matching Interface  │    │ • Property Listing Manager       │ │
│  │ • Saved Matches & Profile   │    │ • Tenant Applicant Dashboard     │ │
│  └─────────────────────────────┘    └──────────────────────────────────┘ │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   Unified Cloud Backend & Microservices                  │
│  • Firebase Authentication (Email/Password & Google OAuth)               │
│  • Cloud Firestore: Real-time listings, matches, and messaging channels  │
│  • Firebase Cloud Storage: Encrypted document vault                      │
└──────────────────┬────────────────────────────────────┬──────────────────┘
                   │                                    │
                   ▼                                    ▼
┌──────────────────────────────────────┐   ┌───────────────────────────────┐
│     Multimodal AI Vision Service     │   │      Geospatial Services      │
│  • Gemini Vision OCR Extraction      │   │  • Google Maps JavaScript API │
│  • Romanian ID / CNP Checksum Engine │   │  • Google Places Autocomplete │
│  • Automated Age / Validity Checks   │   │  • Geocoding & Radius Filters │
└──────────────────────────────────────┘   └───────────────────────────────┘
```

---

## Core Capabilities

| Capability | Technology | Description |
|:---|:---|:---|
| **Identity Verification** | Gemini Vision OCR, Custom RegEx | Validates government IDs with Romanian CNP algorithm verification and age (18+) verification. |
| **Dual Role Topologies** | Next.js Role Routing | Tailored dashboards for tenants (swipe discovery, match queue) and landlords (listing manager, candidate applicant review). |
| **Geospatial Discovery** | Google Maps & Places | Location-based property discovery, transit radius calculation, and interactive neighborhood explorer. |
| **Real-Time Data Engine** | Cloud Firestore | Reactive state synchronization for active matches and instant peer-to-peer messaging. |

---

## Project Structure

```text
rently/
├── app/                           # Next.js 14 App Router hierarchy
│   ├── auth/                      # Authentication & sign-in / registration flows
│   ├── tenant/                    # Tenant portal (swipe, matches, preferences)
│   ├── landlord/                  # Landlord dashboard (listings, candidate review)
│   └── select-role/               # Onboarding role selector
├── components/                    # UI component library
│   ├── ui/                        # shadcn/ui primitives
│   ├── id-verification/           # ID upload & OCR feedback modal
│   └── maps/                      # Google Maps integration widgets
├── lib/
│   ├── firebase/                  # Firestore collections, auth, and storage rules
│   ├── gemini/                    # Gemini Vision prompt templates & parsers
│   └── utils/                     # CNP checksum mathematical validator
├── functions/                     # Firebase serverless Cloud Functions
└── public/                        # Static brand assets
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project credentials
- Google Gemini API Key
- Google Maps API Key

### 1. Installation

```bash
git clone https://github.com/GalanRaduM24/Sullfus_OpenHack2025.git
cd Sullfus_OpenHack2025
npm install
```

### 2. Environment Setup

Create `.env.local` based on `.env.example`:

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

### 3. Run Development Server

```bash
npm run dev
```
Navigate to `http://localhost:3000`.
