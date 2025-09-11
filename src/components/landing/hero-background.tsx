
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { TorusKnot } from '@react-three/drei';
import { useRef } from 'react';
import type { Mesh } from 'three';

function RotatingShape() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <TorusKnot ref={meshRef} args={[1, 0.3, 200, 32]}>
      <meshStandardMaterial wireframe color="#4f46e5" emissive="#4f46e5" emissiveIntensity={2} />
    </TorusKnot>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 opacity-20">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingShape />
      </Canvas>
    </div>
  );
}
