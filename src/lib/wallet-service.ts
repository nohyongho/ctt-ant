
import { Coupon, PointHistory } from './consumer-types';

const COUPONS_KEY = 'airctt_consumer_coupons';
const POINTS_KEY = 'airctt_consumer_points';
const POINT_HISTORY_KEY = 'airctt_consumer_point_history';

const defaultCoupons: Coupon[] = [
  {
    id: 'coupon_1',
    title: '10% 할인 쿠폰',
    description: '전 상품 10% 할인',
    brand: '패션스토어',
    status: 'available',
    expiresAt: '2025-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200',
  },
  {
    id: 'coupon_2',
    title: '5,000원 할인',
    description: '30,000원 이상 구매 시',
    brand: '슈즈마켓',
    status: 'available',
    expiresAt: '2025-06-30',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
  },
  {
    id: 'coupon_3',
    title: '아메리카노 1+1',
    description: '아메리카노 주문 시 1잔 추가',
    brand: '카페 모카',
    status: 'used',
    expiresAt: '2025-01-31',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200',
  },
];

const defaultPointHistory: PointHistory[] = [
  {
    id: 'ph_1',
    userId: 'user_1',
    amount: 500,
    type: 'earned',
    description: '패션스토어 구매 적립',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'ph_2',
    userId: 'user_1',
    amount: 1000,
    type: 'used',
    description: '슈즈마켓 포인트 사용',
    createdAt: '2025-01-10T14:20:00Z',
  },
  {
    id: 'ph_3',
    userId: 'user_1',
    amount: 300,
    type: 'earned',
    description: '카페 모카 구매 적립',
    createdAt: '2025-01-05T09:15:00Z',
  },
];

export const walletService = {
  getCoupons: async (): Promise<Coupon[]> => {
    if (typeof window === 'undefined') return defaultCoupons;
    
    const stored = localStorage.getItem(COUPONS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultCoupons;
      }
    }
    
    localStorage.setItem(COUPONS_KEY, JSON.stringify(defaultCoupons));
    return defaultCoupons;
  },

  getPointBalance: async (): Promise<number> => {
    if (typeof window === 'undefined') return 5000;
    
    const stored = localStorage.getItem(POINTS_KEY);
    if (stored) {
      try {
        return parseInt(stored, 10);
      } catch {
        return 5000;
      }
    }
    
    localStorage.setItem(POINTS_KEY, '5000');
    return 5000;
  },

  getPointHistory: async (): Promise<PointHistory[]> => {
    if (typeof window === 'undefined') return defaultPointHistory;
    
    const stored = localStorage.getItem(POINT_HISTORY_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultPointHistory;
      }
    }
    
    localStorage.setItem(POINT_HISTORY_KEY, JSON.stringify(defaultPointHistory));
    return defaultPointHistory;
  },

  useCoupon: async (couponId: string): Promise<boolean> => {
    const coupons = await walletService.getCoupons();
    const index = coupons.findIndex(c => c.id === couponId);
    
    if (index === -1) return false;
    
    coupons[index].status = 'used';
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    return true;
  },

  addPoints: async (amount: number, description: string): Promise<void> => {
    const balance = await walletService.getPointBalance();
    const newBalance = balance + amount;
    localStorage.setItem(POINTS_KEY, newBalance.toString());
    
    const history = await walletService.getPointHistory();
    const newEntry: PointHistory = {
      id: 'ph_' + Date.now(),
      userId: 'user_1',
      amount,
      type: 'earned',
      description,
      createdAt: new Date().toISOString(),
    };
    history.unshift(newEntry);
    localStorage.setItem(POINT_HISTORY_KEY, JSON.stringify(history));
  },

  usePoints: async (amount: number, description: string): Promise<boolean> => {
    const balance = await walletService.getPointBalance();
    if (balance < amount) return false;
    
    const newBalance = balance - amount;
    localStorage.setItem(POINTS_KEY, newBalance.toString());
    
    const history = await walletService.getPointHistory();
    const newEntry: PointHistory = {
      id: 'ph_' + Date.now(),
      userId: 'user_1',
      amount,
      type: 'used',
      description,
      createdAt: new Date().toISOString(),
    };
    history.unshift(newEntry);
    localStorage.setItem(POINT_HISTORY_KEY, JSON.stringify(history));
    return true;
  },
};
