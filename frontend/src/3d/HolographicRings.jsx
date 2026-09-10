import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus } from '@react-three/drei';
import * as THREE from 'three';

export default function HolographicRings({ mouseRef }) {
  const group = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { x, y } = mouseRef.current;
    const ease = 1 - Math.pow(0.001, delta);
    if (!group.current) return;

    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, y * 0.08, ease * 0.3);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.11, ease * 0.3);
    group.current.rotation.z = Math.sin(t * 0.15) * 0.012;

    group.current.children.forEach((child, i) => {
      child.rotation.z += delta * (i === 0 ? 0.018 : -0.012);
    });
  });

  return (
    <group ref={group}>
      <Torus args={[2.35, 0.004, 6, 180]} rotation={[Math.PI / 2.16, 0.14, 0]}>
        <meshBasicMaterial color="#35e9ff" transparent opacity={0.16} blending={THREE.AdditiveBlending} />
      </Torus>
      <Torus args={[2.72, 0.003, 6, 180]} rotation={[1.05, -0.32, 0.18]}>
        <meshBasicMaterial color="#9b6cff" transparent opacity={0.10} blending={THREE.AdditiveBlending} />
      </Torus>
      <Torus args={[3.08, 0.002, 6, 180]} rotation={[1.62, 0.4, -0.22]}>
        <meshBasicMaterial color="#35e9ff" transparent opacity={0.045} blending={THREE.AdditiveBlending} />
      </Torus>
    </group>
  );
}
