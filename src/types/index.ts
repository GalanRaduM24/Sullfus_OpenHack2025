export type UserRole = 'tenant' | 'landlord';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  avatarUrl?: string;
  introVideoUrl?: string;
  preferences?: TenantPreferences;
  responsivenessRating?: number; // For landlords
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantPreferences {
  minPrice?: number;
  maxPrice?: number;
  location?: {
    lat: number;
    lng: number;
    radius: number; // in km
  };
  propertyType?: string[];
  amenities?: string[];
}

export interface Listing {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  price: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[];
  rules?: string[];
  amenities?: string[];
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  tenantId: string;
  landlordId: string;
  listingId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  matchId: string;
  tenantId: string;
  landlordId: string;
  listingId: string;
  lastMessage?: ChatMessage;
  lastMessageTime?: Date;
  unreadCount?: {
    [userId: string]: number;
  };
}

