import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing, Match } from '../types';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ListingDetailScreenRouteProp = RouteProp<RootStackParamList, 'ListingDetail'>;
type ListingDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ListingDetailScreen = () => {
  const { user } = useAuth();
  const route = useRoute<ListingDetailScreenRouteProp>();
  const navigation = useNavigation<ListingDetailScreenNavigationProp>();
  const { listingId } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadListing();
    checkIfLiked();
  }, [listingId, user]);

  const loadListing = async () => {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', listingId));
      if (listingDoc.exists()) {
        setListing({
          id: listingDoc.id,
          ...listingDoc.data(),
          createdAt: listingDoc.data().createdAt?.toDate(),
          updatedAt: listingDoc.data().updatedAt?.toDate(),
        } as Listing);
      }
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    if (!user || user.role !== 'tenant') return;

    try {
      const q = query(
        collection(db, 'matches'),
        where('tenantId', '==', user.id),
        where('listingId', '==', listingId)
      );
      const snapshot = await getDocs(q);
      setLiked(!snapshot.empty);
    } catch (error) {
      console.error('Error checking like:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !listing || user.role !== 'tenant') return;

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

      setLiked(true);
      Alert.alert('Success', 'You liked this property!');
    } catch (error) {
      console.error('Error liking listing:', error);
      Alert.alert('Error', 'Failed to like property');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {listing.images && listing.images.length > 0 && (
        <Image source={{ uri: listing.images[0] }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>${listing.price}/month</Text>
        <Text style={styles.location}>{listing.location.address}</Text>
        <Text style={styles.description}>{listing.description}</Text>

        {listing.bedrooms && (
          <Text style={styles.detail}>Bedrooms: {listing.bedrooms}</Text>
        )}
        {listing.bathrooms && (
          <Text style={styles.detail}>Bathrooms: {listing.bathrooms}</Text>
        )}
        {listing.propertyType && (
          <Text style={styles.detail}>Type: {listing.propertyType}</Text>
        )}

        {user?.role === 'tenant' && (
          <TouchableOpacity
            style={[styles.likeButton, liked && styles.likeButtonLiked]}
            onPress={handleLike}
            disabled={liked}
          >
            <Text style={styles.likeButtonText}>
              {liked ? 'Liked' : 'Like Property'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#ddd',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A73E8',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  likeButton: {
    backgroundColor: '#1A73E8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  likeButtonLiked: {
    backgroundColor: '#4caf50',
  },
  likeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListingDetailScreen;

