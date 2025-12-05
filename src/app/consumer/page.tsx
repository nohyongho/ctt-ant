'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import MapBackground from '@/components/consumer/MapBackground';
import MissionOverlay from '@/components/consumer/MissionOverlay';
import MonsterPin from '@/components/consumer/MonsterPin';
import BottomNav from '@/components/consumer/BottomNav';
import EventGameWindow from '@/components/consumer/EventGameWindow';
import DailyReportModal from '@/components/consumer/DailyReportModal';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { toast } from 'sonner';

import { Suspense } from 'react';

function ConsumerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showGame, setShowGame] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(true);
  const [activeMonster, setActiveMonster] = useState<any>(null);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  // Check for game auto-start
  useEffect(() => {
    const shouldStartGame = searchParams.get('game') === 'true';
    if (shouldStartGame) {
      setShowGame(true);
      setShowDailyReport(false);
    }
  }, [searchParams]);

  // Mock Data for Monsters on Map
  const monsters = [
    { id: 1, x: '20%', y: '30%', color: '#FFD600', type: 'gold' },
    { id: 2, x: '70%', y: '45%', color: '#00C853', type: 'green' },
    { id: 3, x: '40%', y: '60%', color: '#2962FF', type: 'blue' },
    { id: 4, x: '80%', y: '20%', color: '#FF3D00', type: 'red' },
  ];

  const handleMonsterClick = (monster: any) => {
    setActiveMonster(monster);
    setShowGame(true);
  };

  const handleCouponAcquired = (amount: number, name: string) => {
    toast.success(lang === 'ko' ? `${name} 획득! (+${amount}P)` : `Caught ${name}! (+${amount}P)`, {
      style: { background: '#00C853', color: 'white', border: 'none' },
      icon: '🎉'
    });
    // In a real app, we would remove the monster from the map or mark it as caught
  };

  const toggleLang = () => {
    setLang(prev => prev === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      <MapBackground>
        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle lang={lang} onToggle={toggleLang} />
        </div>

        {/* Mission Overlay */}
        <MissionOverlay lang={lang} />

        {/* Monsters on Map */}
        {monsters.map((monster, index) => (
          <div
            key={monster.id}
            className="absolute"
            style={{ left: monster.x, top: monster.y }}
          >
            <MonsterPin
              color={monster.color}
              delay={index * 0.2}
              onClick={() => handleMonsterClick(monster)}
            />
          </div>
        ))}

        {/* Bottom Navigation */}
        <BottomNav />
      </MapBackground>

      {/* Game Modal */}
      <AnimatePresence>
        {showGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="relative w-full h-full">
              <button
                onClick={() => setShowGame(false)}
                className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-[#00C853] border-2 border-white/50 shadow-[0_0_15px_rgba(0,200,83,0.6)] flex items-center justify-center text-white font-bold transition-transform active:scale-95 hover:bg-[#00E676]"
              >
                ✕
              </button>
              <EventGameWindow
                onCouponAcquired={handleCouponAcquired}
                lang={lang}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Report Modal */}
      <AnimatePresence>
        {showDailyReport && (
          <DailyReportModal
            onClose={() => setShowDailyReport(false)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ConsumerPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <ConsumerPageContent />
    </Suspense>
  );
}
