import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing } from '../types';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

const CreateListingScreen = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
    });

    if (!result.canceled && user) {
      setUploading(true);
      try {
        const uploadPromises = result.assets.map(async (asset) => {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const imageRef = ref(storage, `listings/${user.id}/${Date.now()}_${Math.random()}`);
          await uploadBytes(imageRef, blob);
          return await getDownloadURL(imageRef);
        });

        const urls = await Promise.all(uploadPromises);
        setImages([...images, ...urls]);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload images');
      } finally {
        setUploading(false);
      }
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant location permissions');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setAddress(
        `${geocode.street || ''} ${geocode.city || ''} ${geocode.region || ''}`.trim()
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleCreateListing = async () => {
    if (!user || !title || !description || !price || !address || !propertyType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Get coordinates from address (simplified - in production, use geocoding API)
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 0;
      let lng = 0;

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;
      }

      const listing: Omit<Listing, 'id'> = {
        landlordId: user.id,
        title,
        description,
        price: parseFloat(price),
        location: {
          lat,
          lng,
          address,
        },
        images,
        propertyType,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'listings'), listing);
      Alert.alert('Success', 'Listing created successfully!', [
        { text: 'OK', onPress: () => {} },
      ]);
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Cozy 2BR Apartment"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your property..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Price per month *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g., 1500"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Property Type *</Text>
        <TextInput
          style={styles.input}
          value={propertyType}
          onChangeText={setPropertyType}
          placeholder="e.g., Apartment, House, Condo"
        />

        <Text style={styles.label}>Bedrooms</Text>
        <TextInput
          style={styles.input}
          value={bedrooms}
          onChangeText={setBedrooms}
          placeholder="e.g., 2"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Bathrooms</Text>
        <TextInput
          style={styles.input}
          value={bathrooms}
          onChangeText={setBathrooms}
          placeholder="e.g., 1.5"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Address *</Text>
        <View style={styles.addressContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
          />
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Text style={styles.locationButtonText}>📍</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Images</Text>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={pickImages}
          disabled={uploading}
        >
          <Text style={styles.imageButtonText}>
            {uploading ? 'Uploading...' : '+ Add Images'}
          </Text>
        </TouchableOpacity>
        {images.length > 0 && (
          <Text style={styles.imageCount}>{images.length} image(s) uploaded</Text>
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateListing}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Listing</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 100,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  locationButtonText: {
    fontSize: 20,
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imageButtonText: {
    color: '#666',
    fontSize: 16,
  },
  imageCount: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#1A73E8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateListingScreen;

