// filepath: src/components/backgrounds/ThreeBackground.js
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Line } from "@react-three/drei";
import * as THREE from "three";

function NeuralNetwork() {
  const pointsRef = useRef();
  const count = 1000; // Balanced for cleaner look
  
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
       pos[i * 3] = (Math.random() - 0.5) * 15;
       pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
       pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return [pos];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = time * 0.01;
  });

  return (
    <group>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00f5d4"
          size={0.05} // Increased to "large" size as requested
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#010204]">
      <Canvas camera={{ position: [0, 0, 5], fov: 70 }}>
        <NeuralNetwork />
      </Canvas>
    </div>
  );
}
