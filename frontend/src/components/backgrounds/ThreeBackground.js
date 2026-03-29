import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

function Starfield() {
  const ref = useRef();
  
  const particles = useMemo(() => {
    const data = new Float32Array(5000 * 3);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() - 0.5) * 12;
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 15;
    ref.current.rotation.y -= delta / 25;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#020408]">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Starfield />
      </Canvas>
    </div>
  );
}
