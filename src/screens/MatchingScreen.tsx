import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing, Match } from '../types';
import SwipeCard from '../components/SwipeCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MatchingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MatchingScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MatchingScreenNavigationProp>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'tenant') {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    if (!user || user.role !== 'tenant') return;

    try {
      // Get listings user hasn't matched with yet
      const matchesSnapshot = await getDocs(
        query(collection(db, 'matches'), where('tenantId', '==', user.id))
      );
      const matchedListingIds = new Set(
        matchesSnapshot.docs.map((doc) => doc.data().listingId)
      );

      // Get all listings
      const listingsSnapshot = await getDocs(collection(db, 'listings'));
      const allListings = listingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Listing[];

      // Filter out already matched listings
      const availableListings = allListings.filter(
        (listing) => !matchedListingIds.has(listing.id)
      );

      setListings(availableListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (listing: Listing) => {
    if (!user) return;

    try {
      const match: Match = {
        id: '',
        tenantId: user.id,
        landlordId: listing.landlordId,
        listingId: listing.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const matchRef = doc(collection(db, 'matches'));
      await setDoc(matchRef, {
        ...match,
        id: matchRef.id,
      });

      // Create chat if match is accepted (for MVP, we'll auto-accept)
      // In production, landlord would need to accept the match
      const chatRef = doc(collection(db, 'chats'), matchRef.id);
      await setDoc(chatRef, {
        id: matchRef.id,
        matchId: matchRef.id,
        tenantId: user.id,
        landlordId: listing.landlordId,
        listingId: listing.id,
        lastMessageTime: new Date(),
        unreadCount: {
          [user.id]: 0,
          [listing.landlordId]: 0,
        },
      });

      // Move to next card
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'Failed to like property');
    }
  };

  const handlePass = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  if (user?.role !== 'tenant') {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Matching is only available for tenants</Text>
      </View>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No more listings available</Text>
        <Text style={styles.subMessage}>Check back later for new properties!</Text>
      </View>
    );
  }

  const currentListing = listings[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <SwipeCard
          listing={currentListing}
          onLike={() => handleLike(currentListing)}
          onPass={handlePass}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default MatchingScreen;

