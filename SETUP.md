# Rently - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Google Cloud account (for Maps and Gemini API)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable the following services:
   - Authentication (Email/Password and Google)
   - Cloud Firestore
   - Storage
   - Cloud Messaging (for push notifications)

3. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" and add a web app
   - Copy the config values

4. Update `.env` file with your Firebase config:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

5. Set up Firestore Security Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /listings/{listingId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.resource.data.landlordId == request.auth.uid;
       }
       match /matches/{matchId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
       match /chats/{chatId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
         match /messages/{messageId} {
           allow read, write: if request.auth != null;
         }
       }
     }
   }
   ```

## Step 3: Google Maps Setup

1. Go to Google Cloud Console
2. Enable Maps SDK for Android and iOS
3. Enable Places API
4. Create an API key
5. Update `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-places-api-key
   ```

6. Update `app.json` with your Google Maps API key in the Android config

## Step 4: Gemini API Setup

1. Go to Google AI Studio (https://makersuite.google.com/app/apikey)
2. Create an API key
3. Update `.env`:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```

## Step 5: App Assets

Create the following assets in the `assets` directory:
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (48x48)

You can use tools like https://www.appicon.co/ to generate these.

## Step 6: Run the App

```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web

## Additional Notes

### Google Sign-In
The Google Sign-In is currently a placeholder. To implement it properly:
1. Install `expo-auth-session` and `expo-web-browser`
2. Set up OAuth credentials in Google Cloud Console
3. Update the `signInWithGoogle` function in `src/context/AuthContext.tsx`

### Push Notifications
For push notifications:
1. Set up Expo Notifications
2. Configure Firebase Cloud Messaging
3. Implement notification handlers

### Video Analysis
For tenant intro video analysis:
1. Set up video upload to Firebase Storage
2. Implement video processing
3. Use Gemini API for video analysis

## Troubleshooting

### Firebase Auth Issues
- Make sure Authentication is enabled in Firebase Console
- Check that Email/Password provider is enabled
- Verify Firebase config in `.env`

### Maps Not Loading
- Verify Google Maps API key is correct
- Check that Maps SDK is enabled in Google Cloud Console
- Ensure API key has proper restrictions

### Gemini API Errors
- Verify API key is correct
- Check API quotas and limits
- Ensure Gemini API is enabled in Google Cloud Console

