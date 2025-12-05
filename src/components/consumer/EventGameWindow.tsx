'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Text,
    Float,
    Sparkles,
    PerspectiveCamera,
    Environment,
    MeshTransmissionMaterial,
    Html
} from '@react-three/drei';
import * as THREE from 'three';

import RabbitReward from './RabbitReward';
import { walletService } from '@/lib/wallet-service';

interface FallingGemProps {
    id: number;
    position: [number, number, number];
    color: string;
    scale: number;
    shape: 'dodecahedron' | 'octahedron' | 'icosahedron';
    onInteraction: (id: number) => void;
}

const FallingGem = React.memo(function FallingGem({ id, position, color, scale: gemScale, shape, onInteraction }: FallingGemProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Falling physics applied to the GROUP (so hit box moves with gem)
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Fall down
            groupRef.current.position.y -= delta * 1.5; // Speed

            // Rotate
            groupRef.current.rotation.x += delta;
            groupRef.current.rotation.y += delta * 0.5;

            // Reset if out of view
            if (groupRef.current.position.y < -4) {
                groupRef.current.position.y = 4 + Math.random() * 2;
                groupRef.current.position.x = (Math.random() - 0.5) * 3;
            }
        }
    });

    const Geometry = shape === 'dodecahedron' ? THREE.DodecahedronGeometry :
        shape === 'octahedron' ? THREE.OctahedronGeometry :
            THREE.IcosahedronGeometry;

    return (
        <group ref={groupRef} position={position}>
            {/* Invisible Hit Box (Larger) - Must be visible=true but transparent for raycast */}
            <mesh onClick={() => onInteraction(id)}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Visible Gem */}
            <mesh
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? gemScale * 1.2 : gemScale} // Use random scale
            >
                <primitive object={new Geometry(0.8, 0)} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.5}
                    chromaticAberration={0.1}
                    anisotropy={0.1}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.2}
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                    toneMapped={true}
                />
            </mesh>
        </group>
    );
});

function Explosion({ position, color }: { position: [number, number, number], color: string }) {
    return (
        <group position={position}>
            {/* Core Burst - Firework Style */}
            <Sparkles
                count={40}
                scale={2.5}
                size={8}
                speed={2}
                opacity={1}
                color={color}
                noise={0.5}
            />
            {/* Outer Sparkles - Wide Spread */}
            <Sparkles
                count={30}
                scale={4}
                size={4}
                speed={1}
                opacity={0.6}
                color="#FFF"
                noise={1}
            />
        </group>
    );
}

interface EventGameWindowProps {
    onCouponAcquired: (amount: number, name: string) => void;
    lang: 'ko' | 'en';
}

export default function EventGameWindow({ onCouponAcquired, lang }: EventGameWindowProps) {
    // Generate random gems
    const initialGems = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        pos: [(Math.random() - 0.5) * 3, 4 + Math.random() * 5, (Math.random() - 0.5) * 2] as [number, number, number],
        color: ['#FF3D00', '#00C853', '#2962FF', '#FFD600', '#AA00FF'][Math.floor(Math.random() * 5)],
        scale: 0.2 + Math.random() * 0.3, // Random scale between 0.2 and 0.5
        shape: ['dodecahedron', 'octahedron', 'icosahedron'][Math.floor(Math.random() * 3)] as any,
    })), []);

    const [gems, setGems] = useState(initialGems);
    const [score, setScore] = useState(0);
    const [acquiredCount, setAcquiredCount] = useState(0);
    const [isMaximized, setIsMaximized] = useState(true);
    const [showRabbit, setShowRabbit] = useState(false);
    const [lastReward, setLastReward] = useState('');
    const [explosions, setExplosions] = useState<{ id: number; position: [number, number, number]; color: string }[]>([]);
    const [gameStarted, setGameStarted] = useState(false);

    // Audio Refs for managing playback
    const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            stopAllSounds();
        };
    }, []);

    const t = {
        title: lang === 'ko' ? '보석 잡기' : 'GEM CATCH',
        desc: lang === 'ko' ? '떨어지는 보석을 터치하세요!' : 'Touch the falling gems!',
        score: lang === 'ko' ? '점수' : 'Score',
        coupons: lang === 'ko' ? '쿠폰' : 'Coupons',
        saving: lang === 'ko' ? '저장 중...' : 'Saving...',
        luckyWin: lang === 'ko' ? '당첨!' : 'LUCKY WIN!',
        discount: lang === 'ko' ? '10% 할인 쿠폰' : '10% Discount Coupon',
    };

    const stopAllSounds = () => {
        // Stop all currently playing sounds in our ref
        Object.values(audioRef.current).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        // Clear any pending sound triggers
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };

    const playSound = (type: 'tok' | 'pung' | 'tada' | 'congrats') => {
        // For 'tok', we allow overlap (don't stop others)
        // For win sequence sounds, we might want to manage them

        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.volume = 0.5;

        // If it's a long sound like congrats, store it to stop later
        if (type === 'congrats' || type === 'pung') {
            audioRef.current[type] = audio;
        }

        audio.play().catch(() => { });
    };

    const handleInteraction = (id: number, position: [number, number, number], color: string) => {
        if (!gameStarted) setGameStarted(true);

        // Trigger Explosion
        const explosionId = Date.now();
        setExplosions(prev => [...prev, { id: explosionId, position, color }]);
        setTimeout(() => {
            setExplosions(prev => prev.filter(e => e.id !== explosionId));
        }, 300); // 0.3s duration as requested

        // 10% chance to win
        // 10% chance to win
        const isWin = Math.random() < 0.1;

        if (isWin) {
            // STOP previous win sounds if any
            stopAllSounds();

            // WIN SEQUENCE
            playSound('pung');

            const t1 = setTimeout(() => playSound('tada'), 500);
            const t2 = setTimeout(() => playSound('congrats'), 1000);

            timeoutsRef.current.push(t1, t2);

            setLastReward(t.discount);
            setShowRabbit(true);
            setScore(prev => prev + 1000);
            setAcquiredCount(prev => prev + 1);
            setAcquiredCount(prev => prev + 1);
            onCouponAcquired(1000, t.luckyWin);

            // Save to Wallet
            walletService.addCoupon({
                title: t.discount,
                description: 'Event Game Reward',
                brand: 'AirCTT',
                imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200',
            });
        } else {
            // NORMAL CLICK
            playSound('tok');
            setScore(prev => prev + 10);
        }

        // Respawn gem immediately at top
        setGems(prev => prev.map(g => {
            if (g.id === id) {
                return {
                    ...g,
                    pos: [(Math.random() - 0.5) * 3, 5 + Math.random() * 2, (Math.random() - 0.5) * 2]
                };
            }
            return g;
        }));
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    return (
        <div
            className={`relative bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${isMaximized ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-full rounded-3xl border-4 border-white'
                }`}
            onDoubleClick={toggleMaximize}
        >
            {/* Rabbit Reward Overlay - Scaled to 60% */}
            {showRabbit && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="scale-[0.6] origin-center">
                        <RabbitReward
                            rewardName={lastReward}
                            onComplete={() => setShowRabbit(false)}
                            lang={lang}
                        />
                    </div>
                </div>
            )}

            {/* Scoreboard - Moved to Top Left */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none origin-top-left scale-[0.6]">
                <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-2xl p-2 sm:p-3 flex gap-3 sm:gap-4 shadow-lg">
                    <div className="text-center min-w-[50px]">
                        <div className="text-[10px] sm:text-xs text-white font-bold uppercase tracking-wider drop-shadow-sm">Score</div>
                        <div className="text-lg sm:text-2xl font-black text-white drop-shadow-md">{score.toLocaleString()}</div>
                    </div>
                    <div className="w-0.5 bg-white/40" />
                    <div className="text-center min-w-[50px]">
                        <div className="text-[10px] sm:text-xs text-white font-bold uppercase tracking-wider drop-shadow-sm">Coupons</div>
                        <div className="text-lg sm:text-2xl font-black text-[#FFD600] drop-shadow-md">{acquiredCount}</div>
                    </div>
                </div>
            </div>

            {/* Header / Controls - Moved down slightly & Hides on Start */}
            <div className={`absolute top-24 left-4 z-10 flex items-center gap-4 pointer-events-none transition-opacity duration-500 ${gameStarted ? 'opacity-0' : 'opacity-100'}`}>
                <div className="scale-[0.6] origin-top-left">
                    <h3 className="text-white font-black text-lg sm:text-xl drop-shadow-md flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#00C853] border-2 border-white animate-bounce" />
                        {t.title}
                    </h3>
                    <p className="text-white font-bold text-xs sm:text-sm drop-shadow-sm">{t.desc}</p>
                </div>
            </div>

            {/* Window Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={toggleMaximize}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors border-2 border-white/40 z-50 cursor-pointer text-white"
                >
                    {isMaximized ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M9 3v18" /><path d="m15 9 3 3-3 3" /><path d="M9 12h9" /></svg>
                    )}
                </button>
            </div>

            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.8} color="#FFD600" />

                <Environment preset="park" />

                <group>
                    {gems.map(gem => (
                        <FallingGem
                            key={gem.id}
                            id={gem.id}
                            position={gem.pos}
                            color={gem.color}
                            scale={gem.scale}
                            shape={gem.shape}
                            onInteraction={(id) => handleInteraction(id, gem.pos, gem.color)}
                        />
                    ))}
                </group>

                {/* Explosions */}
                {explosions.map(exp => (
                    <Explosion key={exp.id} position={exp.position} color={exp.color} />
                ))}

                <Sparkles
                    count={30}
                    scale={5}
                    size={4}
                    speed={0.4}
                    opacity={0.5}
                    color="#ffffff"
                />
            </Canvas>
        </div>
    );
}
