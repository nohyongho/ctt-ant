'use client';

import React, { useRef, useState, useMemo } from 'react';
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
import { motion } from 'framer-motion-3d';
import { toast } from 'sonner';

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

        // Simple "explode" or scale down effect logic could go here
        // For now, we rely on the parent removing it or state change
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
                        <div className="px-2 py-1 bg-black/80 text-white text-xs rounded-full whitespace-nowrap border border-white/20 backdrop-blur-md">
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
    // Generate random coupons
    const coupons = useMemo(() => [
        { id: 1, pos: [-1.5, 0.5, 0] as [number, number, number], color: '#ff0055', label: '10% 할인', value: 10 },
        { id: 2, pos: [0, -0.5, 1] as [number, number, number], color: '#00ff88', label: '무료 배송', value: 3000 },
        { id: 3, pos: [1.5, 0.8, -0.5] as [number, number, number], color: '#00ccff', label: '500P', value: 500 },
    ], []);

    const [activeCoupons, setActiveCoupons] = useState(coupons);

    const handleAcquire = (id: number, value: number, label: string) => {
        setActiveCoupons(prev => prev.filter(c => c.id !== id));
        onCouponAcquired(value, label);

        // Play sound effect (optional)
        const audio = new Audio('/sounds/pop.mp3'); // Placeholder path
        audio.volume = 0.5;
        audio.play().catch(() => { }); // Ignore errors if file doesn't exist
    };

    return (
        <div className="w-full h-full relative bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-bold text-lg drop-shadow-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    AR Event Zone
                </h3>
                <p className="text-white/60 text-xs">쿠폰을 터치하여 획득하세요!</p>
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
                            key={coupon.id}
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

            {activeCoupons.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                    <div className="text-center animate-bounce">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            ALL CLEAR!
                        </h2>
                        <p className="text-white mt-2">모든 쿠폰을 획득했습니다</p>
                    </div>
                </div>
            )}
        </div>
    );
}
