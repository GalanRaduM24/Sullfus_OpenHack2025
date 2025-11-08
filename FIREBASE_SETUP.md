# Firebase Setup Quick Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `rently` (or your preferred name)
4. Follow the setup wizard

## Step 2: Enable Firebase Services

### Authentication
1. Go to **Authentication** > **Get started**
2. Enable **Email/Password** sign-in method
3. (Optional) Enable **Google** sign-in provider

### Firestore Database
1. Go to **Firestore Database** > **Create database**
2. Start in **test mode** (we'll add security rules later)
3. Choose a location closest to your users

### Storage
1. Go to **Storage** > **Get started**
2. Start in **test mode**
3. Use the same location as Firestore

## Step 3: Get Firebase Config

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register app with nickname: `Rently Web`
5. Copy the config values (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Update .env File

Open `.env` file and replace the placeholders with your actual values:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIza... (from apiKey)
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 5: Set Up Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listings collection
    match /listings/{listingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.landlordId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.landlordId == request.auth.uid;
    }
    
    // Matches collection
    match /matches/{matchId} {
      allow read: if request.auth != null && 
        (resource.data.tenantId == request.auth.uid || resource.data.landlordId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.tenantId == request.auth.uid || resource.data.landlordId == request.auth.uid);
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if request.auth != null && 
        (resource.data.tenantId == request.auth.uid || resource.data.landlordId == request.auth.uid);
      allow write: if request.auth != null && 
        (resource.data.tenantId == request.auth.uid || resource.data.landlordId == request.auth.uid);
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          (get(/databases/$(database)/documents/chats/$(chatId)).data.tenantId == request.auth.uid || 
           get(/databases/$(database)/documents/chats/$(chatId)).data.landlordId == request.auth.uid);
      }
    }
  }
}
```

3. Click **Publish**

## Step 6: Set Up Storage Security Rules

1. Go to **Storage** > **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listing images
    match /listings/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

## Step 7: Test the Configuration

After updating `.env`, restart your Expo dev server:

```bash
npm start
```

The app should now be able to connect to Firebase!

## Troubleshooting

- **"Firebase: Error (auth/invalid-api-key)"**: Check that your API key in `.env` is correct
- **"Permission denied"**: Make sure Firestore rules are published
- **Environment variables not loading**: Restart Expo dev server after changing `.env`

