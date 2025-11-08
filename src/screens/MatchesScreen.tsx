import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Match, User, Listing } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MatchesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MatchesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MatchesScreenNavigationProp>();
  const [matches, setMatches] = useState<(Match & { otherUser?: User; listing?: Listing })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      let q;
      if (user.role === 'tenant') {
        q = query(collection(db, 'matches'), where('tenantId', '==', user.id), where('status', '==', 'accepted'));
      } else {
        q = query(collection(db, 'matches'), where('landlordId', '==', user.id), where('status', '==', 'accepted'));
      }

      const snapshot = await getDocs(q);
      const matchesData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const matchData = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
            createdAt: docSnapshot.data().createdAt?.toDate(),
            updatedAt: docSnapshot.data().updatedAt?.toDate(),
          } as Match;

          // Fetch other user and listing
          const otherUserId = user.role === 'tenant' ? matchData.landlordId : matchData.tenantId;
          const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
          const listingDoc = await getDoc(doc(db, 'listings', matchData.listingId));

          return {
            ...matchData,
            otherUser: otherUserDoc.exists() ? { id: otherUserDoc.id, ...otherUserDoc.data() } as User : undefined,
            listing: listingDoc.exists() ? { id: listingDoc.id, ...listingDoc.data() } as Listing : undefined,
          };
        })
      );

      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMatch = ({ item }: { item: Match & { otherUser?: User; listing?: Listing } }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => {
        if (item.listing) {
          navigation.navigate('ListingDetail', { listingId: item.listing.id });
        }
      }}
    >
      {item.otherUser?.avatarUrl && (
        <Image source={{ uri: item.otherUser.avatarUrl }} style={styles.avatar} />
      )}
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.otherUser?.name || 'Unknown'}</Text>
        {item.listing && (
          <Text style={styles.matchListing}>{item.listing.title}</Text>
        )}
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => {
            navigation.navigate('Chat', {
              matchId: item.id,
              recipientName: item.otherUser?.name || 'Unknown',
            });
          }}
        >
          <Text style={styles.chatButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No matches yet. Start swiping to find your match!</Text>
          </View>
        }
      />
    </View>
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
  list: {
    padding: 15,
  },
  matchCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd',
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  matchListing: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  chatButton: {
    backgroundColor: '#1A73E8',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default MatchesScreen;

