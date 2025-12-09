
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, Building2, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MerchantRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        category: '',
        phone: '',
        address: '',
        description: ''
    });

    const handleRegister = async () => {
        setLoading(true);
        // TODO: Connect to Real API (Step 3 or later)
        // For now, simulate success and redirect to dashboard

        // Simulate API delay
        await new Promise(r => setTimeout(r, 1500));

        toast.success('입점 신청이 완료되었습니다! 사장님 환영합니다. 🎉');
        router.push('/merchant/dashboard'); // Will create this next
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">AIRCTT 가맹점 입점 신청</h1>
                    <p className="text-slate-500">지금 바로 1,000만 AIRCTT 고객을 만나보세요.</p>
                </div>

                <Card className="border-t-4 border-t-indigo-600 shadow-xl">
                    <CardHeader>
                        <CardTitle>매장 기본 정보 입력</CardTitle>
                        <CardDescription>정확한 정보를 입력해주시면 심사가 빨라집니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>상호명 (사업자등록증 기준)</Label>
                                <Input
                                    placeholder="예: 에어씨티티 강남점"
                                    value={formData.businessName}
                                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>대표자명</Label>
                                <Input
                                    placeholder="홍길동"
                                    value={formData.ownerName}
                                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>업종 카테고리</Label>
                                <Select onValueChange={v => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="선택해주세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restaurant">맛집/식당</SelectItem>
                                        <SelectItem value="cafe">카페/디저트</SelectItem>
                                        <SelectItem value="culture">문화/공연</SelectItem>
                                        <SelectItem value="shopping">쇼핑/패션</SelectItem>
                                        <SelectItem value="beauty">뷰티/운동</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>매장 전화번호</Label>
                                <Input
                                    placeholder="02-1234-5678"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>매장 주소</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="주소 검색 버튼을 눌러주세요"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                                <Button variant="outline" type="button">주소 검색</Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>매장 한줄 소개</Label>
                            <Input
                                placeholder="고객들에게 보여질 매장 소개를 입력하세요."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button
                                size="lg"
                                className="bg-indigo-600 hover:bg-indigo-700 min-w-[150px]"
                                onClick={handleRegister}
                                disabled={loading}
                            >
                                {loading ? '처리중...' : '입점 신청하기'}
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-400 mt-6">
                    © 2025 AIRCTT Merchant Services. All rights reserved.
                </p>

            </motion.div>
        </div>
    );
}
