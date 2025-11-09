/**
 * Cloud Functions for RentHub
 * Firebase backend functions for data management and operations
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {
  onRequest,
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: "europe-west1", // Change to your preferred region
});

/**
 * Populate Firebase with test landlord and properties
 * This is a callable function that can be triggered from the client
 *
 * Usage from client:
 * const functions = getFunctions();
 * const populateData = httpsCallable(functions, 'populateTestData');
 * const result = await populateData();
 */
export const populateTestData = onCall(async () => {
  try {
    logger.info("Starting to populate test data...");

    // Test Landlord Data
    const landlordId = "test-landlord-001";
    const landlordData = {
      role: "landlord",
      name: "Ion Popescu",
      email: "ion.popescu@renthub.ro",
      phone: "+40 721 234 567",
      age: 45,
      description: "Experienced landlord with over 10 years in real estate. I own multiple properties in Bucharest and pride myself on maintaining high-quality apartments and providing excellent service to my tenants.",
      partnerAgencies: "RE/MAX Romania, Artmark",
      profileCompleted: true,
      idVerificationStatus: "verified",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create landlord profile
    await db.collection("users").doc(landlordId).set(landlordData);
    await db.collection("landlordProfiles").doc(landlordId).set(landlordData);
    logger.info(`Created landlord profile: ${landlordId}`);

    // Test Properties
    const properties = [
      {
        title: "Modern 2-Room Apartment in Old Town",
        description: "Beautiful 2-room apartment in the heart of Bucharest's Old Town. Fully furnished with modern amenities, perfect for young professionals or couples. Walking distance to restaurants, cafes, and nightlife. Recently renovated with high-quality finishes.",
        price: 450,
        location: {
          address: "Strada Lipscani 25, Bucharest, Romania",
          lat: 44.4322,
          lng: 26.1027,
        },
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        ],
        landlordId: landlordId,
        landlordName: "Ion Popescu",
        landlordPhone: "+40 721 234 567",
        bedrooms: 1,
        bathrooms: 1,
        area: 55,
        floor: 3,
        totalFloors: 5,
        yearBuilt: 2018,
        furnished: true,
        parking: false,
        balcony: true,
        amenities: ["WiFi", "Air Conditioning", "Washing Machine", "Dishwasher", "Central Heating"],
        rules: {
          petsAllowed: false,
          smokingAllowed: false,
          studentsAllowed: true,
          roommatesAllowed: false,
        },
        availability: "immediate",
        deposit: 450,
        utilities: "Not included",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: "Spacious 3-Room Apartment Near University",
        description: "Large 3-room apartment perfect for students or families. Located near Universitate metro station and Bucharest University. Bright, airy rooms with plenty of storage. Building has elevator and security.",
        price: 550,
        location: {
          address: "Bulevardul Regina Elisabeta 50, Bucharest, Romania",
          lat: 44.4361,
          lng: 26.0969,
        },
        images: [
          "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
          "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
        ],
        landlordId: landlordId,
        landlordName: "Ion Popescu",
        landlordPhone: "+40 721 234 567",
        bedrooms: 2,
        bathrooms: 1,
        area: 75,
        floor: 2,
        totalFloors: 4,
        yearBuilt: 2005,
        furnished: true,
        parking: true,
        balcony: true,
        amenities: ["WiFi", "Central Heating", "Elevator", "Security", "Storage Room"],
        rules: {
          petsAllowed: true,
          smokingAllowed: false,
          studentsAllowed: true,
          roommatesAllowed: true,
        },
        availability: "1st December 2024",
        deposit: 550,
        utilities: "Included (except electricity)",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: "Luxury Penthouse in Primaverii",
        description: "Stunning penthouse apartment in exclusive Primaverii neighborhood. Floor-to-ceiling windows with panoramic city views. Premium finishes throughout. Private terrace perfect for entertaining. Concierge service available.",
        price: 1200,
        location: {
          address: "Strada Primaverii 15, Bucharest, Romania",
          lat: 44.4587,
          lng: 26.0823,
        },
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        ],
        landlordId: landlordId,
        landlordName: "Ion Popescu",
        landlordPhone: "+40 721 234 567",
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        floor: 7,
        totalFloors: 7,
        yearBuilt: 2020,
        furnished: true,
        parking: true,
        balcony: false,
        terrace: true,
        amenities: [
          "WiFi",
          "Air Conditioning",
          "Central Heating",
          "Dishwasher",
          "Washing Machine",
          "Dryer",
          "Jacuzzi",
          "Smart Home",
          "Concierge",
          "Gym Access",
        ],
        rules: {
          petsAllowed: false,
          smokingAllowed: false,
          studentsAllowed: false,
          roommatesAllowed: false,
        },
        availability: "15th December 2024",
        deposit: 2400,
        utilities: "Not included",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: "Cozy Studio in Obor",
        description: "Affordable studio apartment in Obor area. Great for students or young professionals starting out. Close to public transportation and Obor market. Quiet building with friendly neighbors.",
        price: 300,
        location: {
          address: "Strada Ziduri Moși 10, Bucharest, Romania",
          lat: 44.4479,
          lng: 26.1261,
        },
        images: [
          "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
        ],
        landlordId: landlordId,
        landlordName: "Ion Popescu",
        landlordPhone: "+40 721 234 567",
        bedrooms: 0,
        bathrooms: 1,
        area: 30,
        floor: 1,
        totalFloors: 4,
        yearBuilt: 1985,
        furnished: true,
        parking: false,
        balcony: false,
        amenities: ["WiFi", "Central Heating", "Kitchenette"],
        rules: {
          petsAllowed: false,
          smokingAllowed: false,
          studentsAllowed: true,
          roommatesAllowed: false,
        },
        availability: "immediate",
        deposit: 300,
        utilities: "Included",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: "Family Apartment in Baneasa",
        description: "Spacious family apartment in green Baneasa area. Near international schools and parks. Safe neighborhood perfect for families with children. Includes parking spot and storage.",
        price: 800,
        location: {
          address: "Șoseaua București-Ploiești 42, Bucharest, Romania",
          lat: 44.5089,
          lng: 26.0822,
        },
        images: [
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
          "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800",
        ],
        landlordId: landlordId,
        landlordName: "Ion Popescu",
        landlordPhone: "+40 721 234 567",
        bedrooms: 3,
        bathrooms: 2,
        area: 95,
        floor: 4,
        totalFloors: 10,
        yearBuilt: 2015,
        furnished: false,
        parking: true,
        balcony: true,
        amenities: [
          "WiFi",
          "Central Heating",
          "Elevator",
          "Playground",
          "Storage Room",
          "24/7 Security",
        ],
        rules: {
          petsAllowed: true,
          smokingAllowed: false,
          studentsAllowed: false,
          roommatesAllowed: false,
        },
        availability: "1st January 2025",
        deposit: 1600,
        utilities: "Not included",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    // Create properties
    const propertyIds: string[] = [];
    for (const property of properties) {
      const docRef = await db.collection("listings").add(property);
      propertyIds.push(docRef.id);
      logger.info(`Created property: ${property.title} (${docRef.id})`);
    }

    logger.info("Test data population completed successfully");

    return {
      success: true,
      message: "Test data created successfully",
      landlordId: landlordId,
      propertyIds: propertyIds,
      propertiesCount: properties.length,
    };
  } catch (error) {
    logger.error("Error populating test data:", error);
    throw new HttpsError("internal", "Failed to populate test data");
  }
});

/**
 * Verify ID Card using Gemini Vision API
 * This should be called from the client after uploading the image to Storage
 *
 * Input: { imageUrl: string, userId: string, userType: 'tenant' | 'landlord' }
 * Output: { success: boolean, data: IDCardData, verificationId: string }
 */
export const verifyIDCard = onCall(async (request) => {
  try {
    const {imageUrl, userId, userType} = request.data;

    if (!imageUrl || !userId || !userType) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: imageUrl, userId, userType"
      );
    }

    logger.info(`Verifying ID card for user: ${userId}`);

    // TODO: Integrate Gemini Vision API here
    // For now, auto-approve all verifications
    const mockIDData = {
      fullName: "Verified User",
      firstName: "Verified",
      lastName: "User",
      dateOfBirth: "01.01.1990",
      cnp: "1900101000000",
      idNumber: "RO123456",
      nationality: "RO",
      address: "Verified Address",
    };

    // Create verification record
    const verificationRef = await db.collection("id_verifications").add({
      userId: userId,
      userType: userType,
      imageUrl: imageUrl,
      status: "verified", // Auto-approve for now
      data: mockIDData,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user profile
    await db.collection("users").doc(userId).update({
      idVerificationStatus: "verified",
      profileCompleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`ID verification completed for user: ${userId}`);

    return {
      success: true,
      data: mockIDData,
      verificationId: verificationRef.id,
      message: "ID card verified successfully",
    };
  } catch (error) {
    logger.error("Error verifying ID card:", error);
    throw new HttpsError("internal", "Failed to verify ID card");
  }
});

/**
 * Get user profile with verification status
 */
export const getUserProfile = onCall(async (request) => {
  try {
    const {userId} = request.data;

    if (!userId) {
      throw new HttpsError("invalid-argument", "userId is required");
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }

    const userData = userDoc.data();

    // Get verification record if exists
    let verificationData = null;
    const verificationsQuery = await db
      .collection("id_verifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (!verificationsQuery.empty) {
      verificationData = verificationsQuery.docs[0].data();
    }

    return {
      success: true,
      user: userData,
      verification: verificationData,
    };
  } catch (error) {
    logger.error("Error getting user profile:", error);
    throw new HttpsError("internal", "Failed to get user profile");
  }
});

/**
 * Simple hello world function for testing
 */
export const helloWorld = onRequest((req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  res.json({
    message: "Hello from RentHub Firebase Functions!",
    timestamp: new Date().toISOString(),
  });
});
