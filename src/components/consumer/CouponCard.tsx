
'use client';

import { Ticket, Calendar, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coupon } from '@/lib/consumer-types';
import { useI18n } from '@/contexts/I18nContext';

interface CouponCardProps {
  coupon: Coupon;
  distance?: string;
  storeName?: string;
  storeLocation?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
}

export default function CouponCard({ 
  coupon, 
  distance, 
  storeName,
  storeLocation,
  userLocation 
}: CouponCardProps) {
  const { language } = useI18n();

  const statusColors = {
    available: 'bg-green-500',
    used: 'bg-gray-500',
    expired: 'bg-red-500',
  };

  const statusLabels = {
    available: language === 'ko' ? '사용가능' : 'Available',
    used: language === 'ko' ? '사용완료' : 'Used',
    expired: language === 'ko' ? '기간만료' : 'Expired',
  };

  // Google Maps 길찾기 열기
  const openDirections = () => {
    if (storeLocation && userLocation) {
      const origin = `${userLocation.lat},${userLocation.lng}`;
      const destination = `${storeLocation.lat},${storeLocation.lng}`;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
      window.open(url, '_blank');
    }
  };

  // 만료일까지 남은 일수 계산
  const getDaysUntilExpiry = () => {
    const expiryDate = new Date(coupon.expiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilExpiry();
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0 && coupon.status === 'available';
  const isNearby = distance && parseFloat(distance.replace(/[^0-9.]/g, '')) <= 1;

  return (
    <Card className={`overflow-hidden transition-all ${
      coupon.status !== 'available' ? 'opacity-60' : ''
    } ${isNearby ? 'ring-2 ring-green-500/50' : ''}`}>
      <CardContent className="p-0">
        <div className="flex gap-3 sm:gap-4">
          {/* 쿠폰 이미지 */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-muted flex items-center justify-center relative">
            {coupon.imageUrl ? (
              <img
                src={coupon.imageUrl}
                alt={coupon.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Ticket className="h-8 w-8 text-muted-foreground" />
            )}
            
            {/* 가까운 매장 표시 */}
            {isNearby && coupon.status === 'available' && (
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">
                  <MapPin className="w-2.5 h-2.5 mr-0.5" />
                  {language === 'ko' ? '근처' : 'Near'}
                </Badge>
              </div>
            )}
          </div>

          {/* 쿠폰 정보 */}
          <div className="flex-1 py-2 sm:py-3 pr-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">{coupon.title}</h3>
                <p className="text-xs text-muted-foreground">{coupon.brand}</p>
              </div>
              <Badge className={`${statusColors[coupon.status]} text-white text-[10px] sm:text-xs flex-shrink-0`}>
                {statusLabels[coupon.status]}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
              {coupon.description}
            </p>

            {/* 거리 및 만료일 정보 */}
            <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
              {/* 거리 표시 */}
              {distance && coupon.status === 'available' && (
                <div className="flex items-center gap-1 text-xs">
                  <Navigation className="h-3 w-3 text-primary" />
                  <span className={`font-medium ${isNearby ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {distance}
                  </span>
                </div>
              )}

              {/* 만료일 */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className={isExpiringSoon ? 'text-orange-500 font-medium' : ''}>
                  ~{coupon.expiresAt}
                  {isExpiringSoon && (
                    <span className="ml-1">
                      ({daysLeft}{language === 'ko' ? '일 남음' : ' days left'})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* 길찾기 버튼 (가까운 매장일 경우) */}
            {storeLocation && userLocation && coupon.status === 'available' && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs gap-1 text-primary hover:text-primary"
                onClick={openDirections}
              >
                <ExternalLink className="h-3 w-3" />
                {language === 'ko' ? '길찾기' : 'Directions'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
