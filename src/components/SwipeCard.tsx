import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Listing } from '../types';

const { width } = Dimensions.get('window');

interface SwipeCardProps {
  listing: Listing;
  onLike: () => void;
  onPass: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ listing, onLike, onPass }) => {
  return (
    <View style={styles.card}>
      {listing.images && listing.images.length > 0 && (
        <Image source={{ uri: listing.images[0] }} style={styles.image} />
      )}
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>${listing.price}/month</Text>
          <Text style={styles.location}>{listing.location.address}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {listing.description}
          </Text>
          {listing.bedrooms && listing.bathrooms && (
            <Text style={styles.details}>
              {listing.bedrooms} bed • {listing.bathrooms} bath
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.passButton} onPress={onPass}>
            <Text style={styles.passButtonText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={onLike}>
            <Text style={styles.likeButtonText}>♥</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    height: 600,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '70%',
    backgroundColor: '#ddd',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A73E8',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  details: {
    fontSize: 14,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButtonText: {
    fontSize: 30,
    color: '#ff3b30',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButtonText: {
    fontSize: 30,
    color: '#4caf50',
  },
});

export default SwipeCard;

