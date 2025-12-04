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

interface FloatingCouponProps {
    position: [number, number, number];
    color: string;
    onAcquire: () => void;
    label: string;
}

function FloatingCoupon({ position, color, onAcquire, label }: FloatingCouponProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const [acquired, setAcquired] = useState(false);

    useFrame((state) => {
        if (meshRef.current && !acquired) {
            meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() / 2) * 0.2;
            meshRef.current.rotation.y += 0.01;
        }
    });

    const handleClick = () => {
        if (acquired) return;
        setAcquired(true);
        onAcquire();
    };

    if (acquired) return null;

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
            <group>
                <mesh
                    ref={meshRef}
                    onClick={handleClick}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    scale={hovered ? 1.2 : 1}
                >
                    <octahedronGeometry args={[0.8, 0]} />
                    <MeshTransmissionMaterial
                        backside
                        samples={4}
                        thickness={0.5}
                        chromaticAberration={0.05}
                        anisotropy={0.1}
                        distortion={0.1}
                        distortionScale={0.1}
                        temporalDistortion={0.1}
                        color={color}
                        emissive={color}
                        emissiveIntensity={hovered ? 0.5 : 0.1}
                        toneMapped={true}
                    />
                </mesh>
                <Text
                    position={[0, -1.2, 0]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {label}
                </Text>
                {hovered && (
                    <Html position={[0, 1.2, 0]} center>
                        <div className="px-2 py-1 bg-black/80 text-white text-xs rounded-full whitespace-nowrap border border-white/20 backdrop-blur-md pointer-events-none">
                            터치하여 획득!
                        </div>
                    </Html>
                )}
            </group>
        </Float>
    );
}

interface EventGameWindowProps {
    onCouponAcquired: (amount: number, name: string) => void;
}

export default function EventGameWindow({ onCouponAcquired }: EventGameWindowProps) {
    // Initial coupons definition
    const initialCoupons = useMemo(() => [
        { id: 1, pos: [-1.5, 0.5, 0] as [number, number, number], color: '#ff0055', label: '10% 할인', value: 10 },
        { id: 2, pos: [0, -0.5, 1] as [number, number, number], color: '#00ff88', label: '무료 배송', value: 3000 },
        { id: 3, pos: [1.5, 0.8, -0.5] as [number, number, number], color: '#00ccff', label: '500P', value: 500 },
    ], []);

    const [activeCoupons, setActiveCoupons] = useState(initialCoupons);
    const [score, setScore] = useState(0);
    const [acquiredCount, setAcquiredCount] = useState(0);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleAcquire = (id: number, value: number, label: string) => {
        // Remove acquired coupon
        setActiveCoupons(prev => prev.filter(c => c.id !== id));

        // Update score
        setScore(prev => prev + value);
        setAcquiredCount(prev => prev + 1);

        // Notify parent
        onCouponAcquired(value, label);

        // Play sound
        const audio = new Audio('/sounds/pop.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });

        // Respawn logic (Continuous Play)
        setTimeout(() => {
            setActiveCoupons(prev => {
                // Don't add if already exists (simple check)
                if (prev.find(c => c.id === id)) return prev;

                // Randomize position slightly
                const newPos: [number, number, number] = [
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ];

                const respawned = initialCoupons.find(c => c.id === id);
                if (!respawned) return prev;

                return [...prev, { ...respawned, pos: newPos }];
            });
        }, 2000); // Respawn after 2 seconds

        // Simulate Google Sheets Sync
        simulateSync();
    };

    const simulateSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 1500);
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    return (
        <div
            className={`relative bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${isMaximized ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-full rounded-xl border border-white/10'
                }`}
            onDoubleClick={toggleMaximize}
        >
            {/* Header / Controls */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-4 pointer-events-none">
                <div>
                    <h3 className="text-white font-bold text-lg drop-shadow-md flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        AR Event Zone
                    </h3>
                    <p className="text-white/60 text-xs">쿠폰을 터치하여 획득하세요!</p>
                </div>

                {/* Google Sheets Sync Indicator */}
                {isSyncing && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full backdrop-blur-md">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                        <span className="text-[10px] text-green-200 font-mono">Google Sheets 저장 중...</span>
                    </div>
                )}
            </div>

            {/* Window Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={toggleMaximize}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-colors border border-white/10 z-50 cursor-pointer"
                >
                    {isMaximized ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M9 3v18" /><path d="m15 9 3 3-3 3" /><path d="M9 12h9" /></svg>
                    )}
                </button>
            </div>

            {/* Scoreboard */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 flex gap-4">
                    <div className="text-center">
                        <div className="text-[10px] text-white/60 uppercase tracking-wider">Score</div>
                        <div className="text-xl font-bold text-white font-mono">{score.toLocaleString()}</div>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                        <div className="text-[10px] text-white/60 uppercase tracking-wider">Coupons</div>
                        <div className="text-xl font-bold text-yellow-400 font-mono">{acquiredCount}</div>
                    </div>
                </div>
            </div>

            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Environment preset="city" />

                <group>
                    {activeCoupons.map(coupon => (
                        <FloatingCoupon
                            key={`${coupon.id}-${coupon.pos[0]}`} // Unique key for respawn
                            position={coupon.pos}
                            color={coupon.color}
                            label={coupon.label}
                            onAcquire={() => handleAcquire(coupon.id, coupon.value, coupon.label)}
                        />
                    ))}
                </group>

                <Sparkles
                    count={50}
                    scale={5}
                    size={4}
                    speed={0.4}
                    opacity={0.5}
                    color="#ffffff"
                />
                <Sparkles
                    count={30}
                    scale={8}
                    size={6}
                    speed={0.2}
                    opacity={0.3}
                    color="#ff00ff"
                />
            </Canvas>
        </div>
    );
}
