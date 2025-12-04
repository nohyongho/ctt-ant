
import { UserProfile } from './consumer-types';

const CONSUMER_AUTH_KEY = 'airctt_consumer_user';

export const consumerAuthService = {
  login: (user: UserProfile): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONSUMER_AUTH_KEY, JSON.stringify(user));
    }
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONSUMER_AUTH_KEY);
    }
  },

  getUser: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem(CONSUMER_AUTH_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return consumerAuthService.getUser() !== null;
  },

  googleLogin: (): Promise<UserProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: UserProfile = {
          id: 'user_' + Date.now(),
          email: 'demo@airctt.com',
          name: 'AIRCTT Demo User',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          provider: 'GOOGLE',
          createdAt: new Date().toISOString(),
        };
        resolve(mockUser);
      }, 1000);
    });
  },

  kakaoLogin: (): Promise<UserProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: UserProfile = {
          id: 'user_' + Date.now(),
          email: 'kakao@airctt.com',
          name: 'Kakao User',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          provider: 'KAKAO',
          createdAt: new Date().toISOString(),
        };
        resolve(mockUser);
      }, 1000);
    });
  },

  emailLogin: (email: string, password: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const mockUser: UserProfile = {
            id: 'user_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            provider: 'EMAIL',
            createdAt: new Date().toISOString(),
          };
          resolve(mockUser);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },
};
