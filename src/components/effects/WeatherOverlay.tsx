'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeatherOverlayProps {
    type: 'snow' | 'rain' | 'none';
    intensity?: number;
}

export const WeatherOverlay = React.memo(function WeatherOverlay({ type, intensity = 1 }: WeatherOverlayProps) {
    if (type === 'none') return null;

    return (
        <>
            <ambientLight intensity={type === 'rain' ? 0.2 : 0.4} />
            {type === 'snow' && <SnowEffect intensity={intensity} />}
            {type === 'rain' && <RainEffect intensity={intensity} />}
        </>
    );
});

function SnowEffect({ intensity }: { intensity: number }) {
    const count = 100 * intensity;
    const mesh = useRef<THREE.InstancedMesh>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 50; // Slower falling snow
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            const size = 0.5 + Math.random() * 1.5; // Random size variation
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, size, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;

            // Downward movement
            particle.my -= speed * 5;
            if (particle.my < -20) particle.my = 20; // Reset height trigger

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                particle.my + yFactor + (Math.sin((t / 10) * factor) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            // Random rotation for realism
            dummy.rotation.set(
                Math.sin(t),
                Math.cos(t),
                0
            );

            dummy.scale.setScalar(particle.size);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            {/* 
        User requested: "보석 기준으로 10분에 2~3크기"
        Typical Gem is scale 0.2~0.5. 0.8 sphere.
        Let's assume Gem visual size is approx 1 unit.
        Snow should be 0.2 to 0.3 units.
        Sphere geometry radius 0.15 => Diameter 0.3 fits well.
      */}
            <sphereGeometry args={[0.15, 8, 8]} />
            {/* Soft white snow material */}
            <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.8}
                emissive="#ffffff"
                emissiveIntensity={0.2}
                roughness={0.5}
            />
        </instancedMesh>
    );
}

function RainEffect({ intensity }: { intensity: number }) {
    const count = 300 * intensity;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            // ... Logic for rain ...
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;
            const speed = 0.5 + Math.random() * 0.5;
            temp.push({ x, y, z, speed });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (!mesh.current) return;
        particles.forEach((p, i) => {
            p.y -= p.speed;
            if (p.y < -20) p.y = 20;
            dummy.position.set(p.x, p.y, p.z);
            dummy.rotation.x = 0;
            dummy.scale.set(0.05, 1.5, 0.05); // Thin rain streaks
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#aaccff" transparent opacity={0.6} />
        </instancedMesh>
    );
}
