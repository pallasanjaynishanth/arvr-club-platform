import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Particles({ mouseRef, isMobile = false }) {
  const far = useRef();
  const near = useRef();

  const farCount = isMobile ? 650 : 1500;
  const nearCount = isMobile ? 180 : 520;

  const farPositions = useMemo(() => {
    const a = new Float32Array(farCount * 3);
    for (let i = 0; i < farCount; i++) {
      a[i * 3] = (Math.random() - 0.5) * 38;
      a[i * 3 + 1] = (Math.random() - 0.5) * 25;
      a[i * 3 + 2] = -4 - Math.random() * 20;
    }
    return a;
  }, [farCount]);

  const nearPositions = useMemo(() => {
    const a = new Float32Array(nearCount * 3);
    for (let i = 0; i < nearCount; i++) {
      const radius = 3 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      a[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      a[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.65;
      a[i * 3 + 2] = radius * Math.cos(phi) - 2;
    }
    return a;
  }, [nearCount]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { x, y } = mouseRef.current;
    const ease = 1 - Math.pow(0.002, delta);

    if (far.current) {
      far.current.rotation.y = t * 0.004;
      far.current.position.x = THREE.MathUtils.lerp(far.current.position.x, x * 0.12, ease * 0.4);
      far.current.position.y = THREE.MathUtils.lerp(far.current.position.y, -y * 0.08, ease * 0.4);
    }

    if (near.current) {
      near.current.rotation.y = t * 0.012;
      near.current.rotation.x = Math.sin(t * 0.12) * 0.025;
      near.current.position.x = THREE.MathUtils.lerp(near.current.position.x, x * 0.38, ease * 0.55);
      near.current.position.y = THREE.MathUtils.lerp(near.current.position.y, -y * 0.28, ease * 0.55);
    }
  });

  return (
    <group>
      <points ref={far}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={farCount} array={farPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.024} color="#8195c7" transparent opacity={0.46} depthWrite={false} sizeAttenuation />
      </points>

      <points ref={near}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={nearCount} array={nearPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.038} color="#22d3ee" transparent opacity={0.62} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
}
