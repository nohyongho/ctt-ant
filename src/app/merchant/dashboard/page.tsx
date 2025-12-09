'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Store, LayoutDashboard, QrCode, Ticket, FileText,
    Settings, User, Bell, ChevronRight, PlusCircle, Image as ImageIcon, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MerchantDashboard() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* Sidebar (Left) */}
            <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Store className="text-indigo-500" />
                        AIRCTT<span className="text-xs font-normal text-slate-500 ml-1">Biz</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <div className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Management</div>
                    <NavItem icon={LayoutDashboard} label="대시보드" active={true} />
                    <NavItem icon={Store} label="매장정보 관리" />
                    <NavItem icon={FileText} label="메뉴/상품 관리" />
                    <NavItem icon={ImageIcon} label="사진/영상 관리" />

                    <div className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-8">Operations</div>
                    <NavItem icon={Ticket} label="쿠폰 발행/관리" badge="New" onClick={() => router.push('/merchant/coupons/new')} />
                    <NavItem icon={QrCode} label="테이블 QR" onClick={() => router.push('/merchant/qr')} />
                    <NavItem icon={Bell} label="마케팅/알림" onClick={() => router.push('/merchant/marketing')} badge="Hot" />
                </nav>

                <div className="p-4 bg-slate-800/50 m-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">강남 1호점</p>
                            <p className="text-xs text-emerald-400">영업중 • Active</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content (Right) */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-8">
                    <h2 className="text-xl font-bold text-slate-800">대시보드</h2>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">미리보기</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">로그아웃</Button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 space-y-8 overflow-y-auto">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="오늘 방문 손님" value="128명" diff="+12%" />
                        <StatCard title="쿠폰 사용 건수" value="45건" diff="+5%" />
                        <StatCard title="신규 단골 등록" value="8명" diff="+2" />
                        <StatCard title="실시간 매출" value="1,250,000원" diff="-" />
                    </div>

                    {/* Quick Actions (Step 2 Focus) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="col-span-2 shadow-sm">
                            <CardHeader>
                                <CardTitle>매장 관리 필수 항목</CardTitle>
                                <CardDescription>매장 운영을 위해 꼭 설정해주세요.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ActionItem
                                    title="매장 대표 사진 등록"
                                    desc="고객에게 보여질 멋진 사진을 올려주세요."
                                    btnText="등록하기"
                                    done={false}
                                />
                                <ActionItem
                                    title="영업 시간 설정"
                                    desc="매일매일 정확한 영업시간을 알려주세요."
                                    btnText="설정하기"
                                    done={true}
                                />
                                <ActionItem
                                    title="대표 메뉴 등록"
                                    desc="우리 가게의 시그니처 메뉴 3가지를 등록하세요."
                                    btnText="메뉴판 관리"
                                    done={false}
                                />
                            </CardContent>
                        </Card>

                        {/* Notifications / Issues */}
                        <Card className="bg-indigo-50 border-indigo-100">
                            <CardHeader>
                                <CardTitle className="text-indigo-900">🔔 알림 센터</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-white p-3 rounded-lg shadow-sm text-sm border-l-4 border-indigo-500">
                                    <p className="font-bold text-slate-800">쿠폰 재고 부족 임박</p>
                                    <p className="text-slate-500 mt-1">"50% 할인 쿠폰"이 10장 남았습니다.</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm text-sm border-l-4 border-emerald-500">
                                    <p className="font-bold text-slate-800">정산 완료 안내</p>
                                    <p className="text-slate-500 mt-1">12월 07일 매출 정산이 완료되었습니다.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
}

function NavItem({ icon: Icon, label, active, badge, onClick }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
                {label}
            </div>
            {badge && <Badge className="bg-pink-500 hover:bg-pink-600 text-[10px] h-5 px-1.5">{badge}</Badge>}
        </button>
    )
}

function StatCard({ title, value, diff }: any) {
    return (
        <Card>
            <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                    <span className={`text-xs font-bold ${diff.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>{diff}</span>
                </div>
            </CardContent>
        </Card>
    )
}

function ActionItem({ title, desc, btnText, done }: any) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                    <h4 className={`font-bold ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{title}</h4>
                    <p className="text-sm text-slate-500">{desc}</p>
                </div>
            </div>
            {!done && <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">{btnText}</Button>}
        </div>
    )
}
