"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

function PremiumShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Constant slow drift
    const time = state.clock.getElapsedTime();
    const driftX = time * 0.1;
    const driftY = time * 0.15;
    
    // Mouse tracking: state.pointer is normalized between -1 and 1
    const targetX = driftX + (state.pointer.y * Math.PI) / 4;
    const targetY = driftY + (state.pointer.x * Math.PI) / 4;
    
    // Smooth interpolation (damped) towards the target
    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetX, 4, delta);
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetY, 4, delta);
  });

  return (
    <Float
      speed={2} // Animation speed, defaults to 1
      rotationIntensity={0.5} // XYZ rotation intensity, defaults to 1
      floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
      floatingRange={[-0.2, 0.2]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
    >
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.5, 0.4, 256, 64]} />
        <MeshDistortMaterial 
          color="#E25A34" 
          emissive="#111110" 
          roughness={0.2} 
          metalness={0.8} 
          distort={0.3} 
          speed={2} 
          clearcoat={1} 
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#E25A34" />
        
        {/* Core Animated Shape */}
        <PremiumShape />

        {/* Floating Ambient Sparkles */}
        <Sparkles 
          count={150} 
          scale={[10, 10, 10]} 
          size={2} 
          speed={0.4} 
          opacity={0.4} 
          color="#E25A34" 
        />
        <Sparkles 
          count={50} 
          scale={[12, 12, 12]} 
          size={3} 
          speed={0.2} 
          opacity={0.2} 
          color="#ffffff" 
        />
      </Canvas>
    </div>
  );
}
