import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import type { Mesh } from "three";

function DiamondMesh({ parallax }: { parallax: { x: number; y: number } }) {
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.36;
    mesh.current.rotation.x += (parallax.y * 0.18 - mesh.current.rotation.x) * 0.04;
    mesh.current.position.x += (parallax.x * 0.34 - mesh.current.position.x) * 0.045;
  });

  return (
    <mesh ref={mesh}>
      <octahedronGeometry args={[1.35, 2]} />
      <meshPhysicalMaterial color="#fafdff" transmission={0.54} roughness={0.08} metalness={0.05} thickness={0.7} clearcoat={1} />
    </mesh>
  );
}

export default function HeroDiamond() {
  const reduce = useReducedMotion();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  return (
    <div
      className="hero-gem"
      onMouseMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setParallax({ x: (event.clientX - rect.left) / rect.width - 0.5, y: (event.clientY - rect.top) / rect.height - 0.5 });
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 42 }} dpr={[1, 1.6]}>
        <ambientLight intensity={1.1} />
        <pointLight position={[3, 2, 4]} color="#f8d889" intensity={6} />
        <pointLight position={[-4, -1, 3]} color="#b9a2ff" intensity={4} />
        <DiamondMesh parallax={parallax} />
      </Canvas>
      <div className="gem-rays" />
      <div className="gem-orbit" />
    </div>
  );
}
