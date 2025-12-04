'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Camera,
  QrCode,
  Terminal,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wallet,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DarkToggle } from '@/components/theme/DarkToggle';
import { toast } from 'sonner';
import EventGameWindow from '@/components/consumer/EventGameWindow';

// PRD 3.1.2.1 Global Type
declare global {
  interface Window {
    onUnityMessage?: (msg: any) => void;
  }
}

// PRD 3.1.2.2 Unity -> Web Types
type RewardTier = 1 | 2 | 3 | 4 | 5;
type RewardKind = 'COIN' | 'COUPON';

interface Reward {
  id: string;
  label: string;
  amount: number;
  tier: RewardTier;
  kind: RewardKind;
  createdAt: string;
  qrToken: string;
}

type UnityMessage =
  | { type: 'STEP'; step: RewardTier }
  | { type: 'REWARD'; payload: Reward }
  | { type: 'LOG'; message: string }
  | any;

export default function ConsumerEventPage() {
  // State for PRD 3.1.3
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [cameraAllowed, setCameraAllowed] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  // New State for Unity Integration
  const [reward, setReward] = useState<Reward | null>(null);
  const [showWallet, setShowWallet] = useState<boolean>(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize shareUrl
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Helper to append logs (PRD 3.1.2.3)
  const appendLog = (message: string) => {
    const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${message}`].slice(-80)); // Keep last 80 lines
  };

  // PRD 3.1.2.3 Unity Message Handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.onUnityMessage = (msg: UnityMessage) => {
      // Log raw message for debugging
      appendLog(`Unity Msg: ${JSON.stringify(msg)}`);

      if (msg.type === 'STEP') {
        // Limit step range 1-5
        const nextStep = Math.max(1, Math.min(5, Number(msg.step)));
        setCurrentStep(nextStep);
        appendLog(`단계 변경됨: ${nextStep}`);
      } else if (msg.type === 'REWARD') {
        const newReward = msg.payload as Reward;
        setReward(newReward);
        setShowWallet(true);
        appendLog(`리워드 수신: ${newReward.label}`);
        toast.success(`리워드 획득! ${newReward.label}`);
      } else if (msg.type === 'LOG') {
        appendLog(`[Unity] ${msg.message}`);
      }
    };

    // Cleanup on unmount
    return () => {
      window.onUnityMessage = undefined;
    };
  }, []);

  // PRD 3.1.5.1 Camera Permission Request
  const requestCameraPermission = async () => {
    try {
      appendLog('카메라 권한 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Stop tracks immediately as we just want to check permission
      stream.getTracks().forEach(track => track.stop());

      setCameraAllowed(true);
      appendLog('✅ 카메라 권한 허용됨');
      toast.success('카메라 권한이 허용되었습니다.');
    } catch (error) {
      console.error(error);
      setCameraAllowed(false);
      appendLog('❌ 카메라 권한 거부 또는 에러');
      toast.error('카메라 권한을 허용해주세요.');
    }
  };

  // 3D Game Reward Handler
  const handleGameReward = (amount: number, label: string) => {
    const newReward: Reward = {
      id: crypto.randomUUID(),
      label: label,
      amount: amount,
      tier: currentStep as RewardTier,
      kind: 'COUPON',
      createdAt: new Date().toISOString(),
      qrToken: 'CTT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    };

    setReward(newReward);
    setShowWallet(true);
    appendLog(`게임 리워드 획득: ${label} (${amount}원)`);
    toast.success(`🎉 ${label} 획득!`);
  };

  // PRD 3.1.6 Test Reward Trigger (Legacy/Dev)
  const handleTestReward = () => {
    handleGameReward(10000, '테스트 AR 쿠폰');
  };

  return (
    <div className="min-h-screen p-4 space-y-6 pb-24 relative">
      {/* PRD 3.1.1 Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:flex">
            STEP {currentStep} / 5
          </Badge>
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            AR CTT 이벤트 존
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            연동 상태: Web UI 준비 완료
          </div>
          {/* Job 2: Dark Mode Toggle */}
          <DarkToggle />
        </div>
      </header>

      {/* PRD 3.1.7 Wallet / Reward Display (Overlay or Card) */}
      {showWallet && reward && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowWallet(false)}
        >
          <Card className="w-full max-w-sm bg-background border-2 border-primary/50 shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="relative pb-2">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setShowWallet(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Wallet className="w-5 h-5" />
                CTT 지갑 · QR 쿠폰
              </CardTitle>
              <CardDescription>
                가맹점에서 아래 QR을 스캔하여 사용하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="text-center space-y-1">
                <Badge variant="secondary" className="mb-2">
                  STEP {reward.tier} 리워드
                </Badge>
                <h3 className="text-xl font-bold">{reward.label}</h3>
                <p className="text-2xl font-bold text-primary">
                  {reward.amount.toLocaleString()}원
                </p>
                <p className="text-xs text-muted-foreground">
                  발급: {new Date(reward.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-center p-4 bg-white rounded-xl mx-auto w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(reward.qrToken)}`}
                  alt="Reward QR"
                  className="w-40 h-40"
                />
              </div>

              <div className="text-center space-y-2">
                <div className="p-2 bg-muted rounded font-mono text-xs">
                  {reward.qrToken}
                </div>
                <p className="text-xs text-muted-foreground">
                  이 화면을 캡처하거나 지갑 메뉴에서 다시 확인할 수 있습니다.
                </p>
              </div>

              <Button className="w-full led-btn-base led-btn-gold" onClick={() => setShowWallet(false)}>
                확인 완료
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* PRD 3.1.4 QR Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                모바일 연결
              </CardTitle>
              <CardDescription>
                PC 화면이라면 휴대폰으로 이 페이지를 열어보세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs break-all">
                {shareUrl || 'Loading...'}
              </div>

              <div className="flex flex-col items-center gap-4">
                {showQr && shareUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-white rounded-xl shadow-lg"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
                      alt="Page QR Code"
                      className="w-40 h-40"
                    />
                  </motion.div>
                )}

                {/* PRD 3.1.4 Button with LED styles */}
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="led-btn-base led-btn-green w-full sm:w-auto"
                >
                  {showQr ? 'QR 코드 닫기' : 'QR 코드 열기'}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  TIP: localhost 대신 192.168.x.x IP를 사용해야<br />
                  휴대폰에서 접속 가능합니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PRD 3.1.5 AR Event Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card h-[500px] overflow-hidden relative border-0">
            {/* 3D Game Window */}
            <div className="absolute inset-0">
              <EventGameWindow onCouponAcquired={handleGameReward} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* PRD 3.1.6 Test Trigger Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="glass-card border-dashed border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              개발자 테스트 도구
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Button size="sm" variant="secondary" onClick={handleTestReward}>
              더미 리워드 지급 (테스트)
            </Button>
            <div className="text-xs text-muted-foreground">
              Unity 메시지 수신 시뮬레이션
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* PRD 3.1.8 Logs Console */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4" />
              시스템 로그
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-44 rounded-md border bg-black/90 p-4">
              <div className="space-y-1 font-mono text-xs text-green-400">
                {logs.length === 0 && (
                  <span className="text-gray-500 opacity-50">
                    대기 중... 이벤트가 발생하면 여기에 기록됩니다.
                  </span>
                )}
                {logs.map((log, i) => (
                  <div key={i} className="break-all">
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogs([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                로그 비우기
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* PRD 3.1.9 Unity Debug Footer */}
      <footer className="text-[10px] text-muted-foreground text-center font-mono opacity-50">
        Unity Call Example: window.onUnityMessage(&#123; type: 'REWARD', payload: ... &#125;)
      </footer>
    </div>
  );
}
