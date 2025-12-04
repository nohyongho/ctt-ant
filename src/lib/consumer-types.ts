
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  provider: 'GOOGLE' | 'KAKAO' | 'EMAIL';
  createdAt: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  brand: string;
  status: 'available' | 'used' | 'expired';
  expiresAt: string;
  imageUrl?: string;
}

export interface PointHistory {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'used';
  description: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  openHours: string;
  distance?: string;
  tags?: string[];
  contact?: string;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  createdAt: string;
  type: 'online' | 'offline';
}

export interface FittingItem {
  id: string;
  name: string;
  category: 'clothing' | 'shoes' | 'hats';
  imageUrl: string;
  price?: number;
  brand?: string;
}

export interface FittingHistory {
  id: string;
  userId: string;
  itemId: string;
  storeId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
