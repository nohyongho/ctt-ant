
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Ticket,
  Calendar,
  Users,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Gift,
  Percent,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Wand2,
  Brain,
  Zap,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { couponService, initMerchantDemo } from '@/lib/merchant-service';
import { MerchantCoupon } from '@/lib/merchant-types';
import { toast } from 'sonner';
import AIBunnyAssistant from '@/components/shared/AIBunnyAssistant';

type LocalDiscountType = 'PERCENT' | 'FIXED';
type CreationStep = 'FORM' | 'PAYMENT';

interface NewCouponFormState {
  name: string;
  description: string;
  discountType: LocalDiscountType;
  discountValue: number | '';
  minPurchase: number | '';
  maxDiscount: number | '';
  validFrom: string;
  validUntil: string;
  totalQuantity: number;
  image: File | null;
  imagePreview: string | null;
}

export default function MerchantCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<MerchantCoupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<MerchantCoupon | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailCoupon, setSelectedDetailCoupon] = useState<MerchantCoupon | null>(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [creationStep, setCreationStep] = useState<CreationStep>('FORM');

  const [newCoupon, setNewCoupon] = useState<NewCouponFormState>({
    name: '',
    description: '',
    discountType: 'PERCENT',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    totalQuantity: 100,
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    initMerchantDemo();
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    const all = couponService.getAll() as MerchantCoupon[];
    const normalized = all.map((coupon) => ({
      ...coupon,
      name: coupon.name ?? coupon.title,
    }));
    setCoupons(normalized);
  };

  const filteredCoupons = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();

    return coupons.filter((coupon) => {
      const baseName = coupon.name ?? coupon.title ?? '';
      const desc = coupon.description ?? '';
      const matchesSearch =
        baseName.toLowerCase().includes(normalizedQuery) ||
        desc.toLowerCase().includes(normalizedQuery);

      if (activeTab === 'all') {
        return matchesSearch;
      }
      if (activeTab === 'active') {
        return matchesSearch && coupon.status === 'ACTIVE';
      }
      if (activeTab === 'expired') {
        return matchesSearch && coupon.status === 'EXPIRED';
      }
      if (activeTab === 'draft') {
        return matchesSearch && coupon.status === 'INACTIVE';
      }

      return matchesSearch;
    });
  }, [coupons, searchQuery, activeTab]);

  const stats = useMemo(() => {
    const totalUsed = coupons.reduce(
      (sum, c) => sum + (c.usedQuantity ?? 0),
      0,
    );
    const totalQty = coupons.reduce(
      (sum, c) => sum + (c.totalQuantity ?? 0),
      0,
    );
    const usageRate =
      totalQty > 0 ? Math.round((totalUsed / totalQty) * 100) : 0;

    return [
      {
        label: '전체 쿠폰',
        value: coupons.length,
        icon: Ticket,
        color: 'from-violet-500 to-purple-500',
      },
      {
        label: '활성 쿠폰',
        value: coupons.filter((c) => c.status === 'ACTIVE').length,
        icon: CheckCircle2,
        color: 'from-emerald-500 to-green-500',
      },
      {
        label: '총 사용',
        value: totalUsed,
        icon: Users,
        color: 'from-blue-500 to-cyan-500',
      },
      {
        label: '사용률',
        value: `${usageRate}%`,
        icon: TrendingUp,
        color: 'from-amber-500 to-orange-500',
      },
    ];
  }, [coupons]);

  const handleAIGenerate = async () => {
    setIsAIGenerating(true);
    toast.info('AI가 쿠폰을 생성하고 있습니다...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const aiSuggestions = [
      {
        name: '신규 고객 환영 쿠폰',
        description: '첫 구매 시 20% 할인 혜택',
        discountType: 'PERCENT' as LocalDiscountType,
        discountValue: 20,
        minPurchase: 10000,
        maxDiscount: 5000,
      },
      {
        name: '주말 특가 쿠폰',
        description: '주말 한정 15% 할인',
        discountType: 'PERCENT' as LocalDiscountType,
        discountValue: 15,
        minPurchase: 20000,
        maxDiscount: 10000,
      },
      {
        name: '단골 고객 감사 쿠폰',
        description: '5회 이상 방문 고객 10,000원 할인',
        discountType: 'FIXED' as LocalDiscountType,
        discountValue: 10000,
        minPurchase: 50000,
        maxDiscount: 10000,
      },
    ];

    const suggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setNewCoupon({
      ...suggestion,
      validFrom: today.toISOString().split('T')[0],
      validUntil: nextMonth.toISOString().split('T')[0],
      totalQuantity: 100,
      image: null,
      imagePreview: null,
    });

    setIsAIGenerating(false);
    toast.success('AI가 쿠폰을 생성했습니다!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setNewCoupon(prev => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file)
        }));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewCoupon(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result as string
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCreateCoupon = (skipValidation = false) => {
    if (!skipValidation && (!newCoupon.name || !newCoupon.validFrom || !newCoupon.validUntil)) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }

    const created = couponService.create({
      code: '',
      merchantId: '',
      title: newCoupon.name,
      description: newCoupon.description,
      discountType:
        newCoupon.discountType === 'PERCENT'
          ? 'PERCENTAGE'
          : 'FIXED_AMOUNT',
      discountValue: Number(newCoupon.discountValue),
      minPurchaseAmount: Number(newCoupon.minPurchase),
      maxDiscountAmount: Number(newCoupon.maxDiscount),
      validFrom: newCoupon.validFrom,
      validUntil: newCoupon.validUntil,
      totalQuantity: newCoupon.totalQuantity,
      usedQuantity: 0,
      status: 'INACTIVE',
      imageUrl: newCoupon.imagePreview || undefined,
      mediaType: newCoupon.image?.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      createdAt: new Date().toISOString(),
    } as MerchantCoupon);

    const normalized = {
      ...created,
      name: created.name ?? created.title,
    };

    setCoupons((prev) => [...prev, normalized]);

    setIsCreateOpen(false);
    setNewCoupon({
      name: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      totalQuantity: 100,
      image: null,
      imagePreview: null,
    });
    setCreationStep('FORM');
    setActiveTab('draft');
    toast.success('쿠폰이 생성되어 대기함에 저장되었습니다');
  };

  const handleDeleteCoupon = () => {
    if (!selectedCoupon) {
      return;
    }

    couponService.delete(selectedCoupon.id);
    setCoupons((prev) => prev.filter((c) => c.id !== selectedCoupon.id));
    setIsDeleteOpen(false);
    setSelectedCoupon(null);
    toast.success('쿠폰이 삭제되었습니다');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            활성
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">
            <XCircle className="w-3 h-3 mr-1" />
            만료
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Clock className="w-3 h-3 mr-1" />
            대기
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCouponName = (coupon: MerchantCoupon) => {
    return coupon.name ?? coupon.title;
  };

  const getDiscountDisplay = (coupon: MerchantCoupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    }
    if (coupon.discountType === 'FIXED_AMOUNT') {
      return `${coupon.discountValue.toLocaleString()}원`;
    }
    return '무료 제공';
  };

  const getUsageRate = (coupon: MerchantCoupon) => {
    if (!coupon.totalQuantity) {
      return 0;
    }
    return Math.round((coupon.usedQuantity / coupon.totalQuantity) * 100);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass-dark">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white font-bold text-lg">쿠폰 관리</h1>
              <p className="text-white/70 text-xs">총 {coupons.length}개</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              새 쿠폰
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card overflow-hidden border-2 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold gradient-text">AI 쿠폰 생성</h3>
                  <p className="text-xs text-muted-foreground">인공지능이 최적의 쿠폰을 추천합니다</p>
                </div>
              </div>
              <Button
                onClick={handleAIGenerate}
                disabled={isAIGenerating}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600"
              >
                {isAIGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    AI 생성 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    AI로 쿠폰 자동 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="쿠폰 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 glass-card">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="active">활성</TabsTrigger>
              <TabsTrigger value="expired">만료</TabsTrigger>
              <TabsTrigger value="draft">대기</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredCoupons.map((coupon, index) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="glass-card hover-lift overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedDetailCoupon(coupon);
                    setIsDetailOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${coupon.discountType === 'PERCENTAGE'
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                            : 'bg-gradient-to-br from-emerald-500 to-green-600'
                            }`}
                        >
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="w-6 h-6 text-white" />
                          ) : (
                            <Gift className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {getCouponName(coupon)}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {coupon.description}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            상세보기
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            복제
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold gradient-text">
                        {getDiscountDisplay(coupon)}
                      </div>
                      {getStatusBadge(coupon.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(
                          coupon.validFrom,
                        ).toLocaleDateString()} ~{' '}
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground justify-end">
                        <Users className="w-3 h-3" />
                        {coupon.usedQuantity} / {coupon.totalQuantity}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">사용률</span>
                        <span className="font-medium">
                          {getUsageRate(coupon)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                          style={{
                            width: `${getUsageRate(coupon)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredCoupons.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <Ticket className="w-8 h-8 text-violet-500" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? '검색 결과가 없습니다'
                    : '등록된 쿠폰이 없습니다'}
                </p>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  첫 쿠폰 만들기
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {creationStep === 'FORM' ? '새 쿠폰 만들기' : '쿠폰 결제'}
            </DialogTitle>
            <DialogDescription>
              {creationStep === 'FORM' ? '새로운 할인 쿠폰을 생성합니다' : '쿠폰 발급 비용을 결제합니다'}
            </DialogDescription>
          </DialogHeader>

          {creationStep === 'FORM' ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleAIGenerate}
                  disabled={isAIGenerating}
                  variant="outline"
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  AI 자동 생성
                </Button>
              </div>

              <div>
                <Label>쿠폰 파일</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden bg-black/20 group hover:border-violet-500/50 transition-colors">
                    {newCoupon.imagePreview ? (
                      newCoupon.image?.type.startsWith('video/') ? (
                        <video
                          src={newCoupon.imagePreview}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={newCoupon.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                    )}

                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-medium">쿠폰 업로드</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, GIF, MP4, WEBM (최대 100MB)<br />
                        권장 사이즈: 500x500px
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="relative overflow-hidden led-btn-green text-slate-900 font-bold hover:scale-105 transition-transform"
                        style={{ animation: 'led-breath 2s infinite' }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        쿠폰 업로드
                        <Input
                          type="file"
                          accept="image/*,video/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleImageChange}
                        />
                      </Button>
                      {newCoupon.image && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setNewCoupon(prev => ({ ...prev, image: null, imagePreview: null }))}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>쿠폰명 *</Label>
                <Input
                  value={newCoupon.name}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, name: e.target.value })
                  }
                  placeholder="예: 신규 가입 10% 할인"
                />
              </div>

              <div>
                <Label>설명</Label>
                <Textarea
                  value={newCoupon.description}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, description: e.target.value })
                  }
                  placeholder="쿠폰에 대한 설명을 입력하세요"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>할인 유형</Label>
                  <Select
                    value={newCoupon.discountType}
                    onValueChange={(value: LocalDiscountType) =>
                      setNewCoupon({ ...newCoupon, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENT">퍼센트 (%)</SelectItem>
                      <SelectItem value="FIXED">정액 (원)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>할인 값</Label>
                  <Input
                    type="number"
                    value={newCoupon.discountValue}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discountValue: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>시작일 *</Label>
                  <Input
                    type="date"
                    value={newCoupon.validFrom}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, validFrom: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>종료일 *</Label>
                  <Input
                    type="date"
                    value={newCoupon.validUntil}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, validUntil: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>최소 결제 금액</Label>
                  <Input
                    type="number"
                    value={newCoupon.minPurchase}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        minPurchase: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>최대 할인 금액</Label>
                  <Input
                    type="number"
                    value={newCoupon.maxDiscount}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        maxDiscount: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>발급 수량</Label>
                <Input
                  type="number"
                  value={newCoupon.totalQuantity}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      totalQuantity: Number(e.target.value || 0),
                    })
                  }
                />
              </div>


              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <div className="text-center text-sm text-muted-foreground">
                  1장당 50원 결제
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={() => setCreationStep('PAYMENT')}
                    className="bg-gradient-to-r from-violet-500 to-purple-600"
                  >
                    결제하기
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>발급 수량</Label>
                  <Input
                    type="number"
                    value={newCoupon.totalQuantity}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        totalQuantity: Number(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    기본 100장부터 시작합니다
                  </p>
                </div>

                <Card className="bg-slate-950/50 border-white/10">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">발급 단가</span>
                      <span>50원 / 장</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">발급 수량</span>
                      <span>{newCoupon.totalQuantity.toLocaleString()}장</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-lg">
                      <span>예상 결제 금액</span>
                      <span className="text-violet-400">
                        {(newCoupon.totalQuantity * 50).toLocaleString()}원
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>결제 수단</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start h-auto py-3 px-4 border-violet-500 bg-violet-500/10">
                      <div className="text-left">
                        <div className="font-bold">신용/체크카드</div>
                        <div className="text-xs text-muted-foreground">간편결제 포함</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 px-4">
                      <div className="text-left">
                        <div className="font-bold">무통장입금</div>
                        <div className="text-xs text-muted-foreground">가상계좌 발급</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setCreationStep('FORM')}
                >
                  이전
                </Button>
                <Button
                  onClick={() => handleCreateCoupon(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-8"
                >
                  확인
                </Button>
              </div>
            </div>
          )}</DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              쿠폰 상세 정보
            </DialogTitle>
          </DialogHeader>

          {selectedDetailCoupon && (
            <div className="space-y-6">
              {/* Media Preview */}
              <div className="aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center relative group">
                {selectedDetailCoupon.imageUrl ? (
                  selectedDetailCoupon.imageUrl.startsWith('blob:') && selectedDetailCoupon.imageUrl.includes('video') ? (
                    <video
                      src={selectedDetailCoupon.imageUrl}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      loop
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedDetailCoupon.imageUrl}
                      alt={selectedDetailCoupon.name}
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 opacity-50" />
                    <span className="text-sm">이미지가 없습니다</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10">
                    미리보기
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold gradient-text">
                    {getCouponName(selectedDetailCoupon)}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {selectedDetailCoupon.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">할인 혜택</div>
                    <div className="font-bold text-lg text-violet-400">
                      {getDiscountDisplay(selectedDetailCoupon)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">유효 기간</div>
                    <div className="font-medium text-sm">
                      {new Date(selectedDetailCoupon.validUntil).toLocaleDateString()} 까지
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">발급 수량</div>
                    <div className="font-medium text-sm">
                      {selectedDetailCoupon.totalQuantity.toLocaleString()}장
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">상태</div>
                    <div>{getStatusBadge(selectedDetailCoupon.status)}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 text-lg font-bold shadow-lg shadow-blue-500/20">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.0002 0.000198364C5.38338 0.000198364 0.000198364 5.38338 0.000198364 12.0002C0.000198364 18.617 5.38338 24.0002 12.0002 24.0002C18.617 24.0002 24.0002 18.617 24.0002 12.0002C23.9918 5.38696 18.6134 0.00859833 12.0002 0.000198364ZM17.6102 17.5122L6.5002 16.5142L10.0222 6.5002L17.6102 17.5122Z" /></svg>
                    Unity / VAN 결제 연동
                  </div>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  * 유니티 앱 및 VAN 사 결제 모듈과 연동하여 실시간 쿠폰 발급을 처리합니다.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>쿠폰 삭제</DialogTitle>
            <DialogDescription>
              정말로 "
              {selectedCoupon ? getCouponName(selectedCoupon) : ''}
              " 쿠폰을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteCoupon}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIBunnyAssistant userType="merchant" />
    </div >
  );
}
