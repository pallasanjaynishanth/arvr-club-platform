import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Octahedron, Torus, Line, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const CYAN = '#35e9ff';
const VIOLET = '#9b6cff';
const WHITE = '#e9fbff';

function Arc({ radius, color, rotation, start, end, opacity = 0.4, width = 1 }) {
  const points = useMemo(() => {
    const result = [];
    const steps = 56;
    for (let i = 0; i <= steps; i += 1) {
      const a = start + (end - start) * (i / steps);
      result.push([Math.cos(a) * radius, Math.sin(a) * radius, 0]);
    }
    return result;
  }, [radius, start, end]);

  return (
    <Line points={points} color={color} lineWidth={width} transparent opacity={opacity} rotation={rotation} />
  );
}

function SurfaceNodes({ isMobile }) {
  const positions = useMemo(() => {
    const count = isMobile ? 44 : 82;
    const data = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const a = golden * i;
      const radius = 1.68 + Math.sin(i * 2.8) * 0.025;
      data[i * 3] = radius * r * Math.cos(a);
      data[i * 3 + 1] = radius * y;
      data[i * 3 + 2] = radius * r * Math.sin(a);
    }
    return data;
  }, [isMobile]);

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={CYAN}
        size={isMobile ? 0.032 : 0.044}
        sizeAttenuation
        depthWrite={false}
        opacity={0.72}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function EnergyParticles({ isMobile }) {
  const group = useRef();
  const particles = useMemo(() => {
    const count = isMobile ? 34 : 64;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      const band = i % 4;
      return {
        radius: 0.72 + band * 0.13,
        y: Math.sin(i * 1.47) * (0.26 + band * 0.05),
        a,
        size: 0.018 + (i % 3) * 0.008,
        color: i % 2 ? VIOLET : CYAN,
      };
    });
  }, [isMobile]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.22;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.06;
  });

  return (
    <group ref={group} rotation={[0.35, 0.1, 0.2]}>
      {particles.map((p, i) => (
        <mesh key={i} position={[Math.cos(p.a) * p.radius, p.y, Math.sin(p.a) * p.radius]}>
          <sphereGeometry args={[p.size, 7, 7]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function CoreEngine() {
  const group = useRef();
  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.x += delta * 0.18;
    group.current.rotation.y -= delta * 0.28;
    group.current.rotation.z += delta * 0.08;
    const pulse = 1 + Math.sin(t * 2.2) * 0.045;
    group.current.scale.setScalar(pulse);
  });

  return (
    <group ref={group}>
      <Octahedron args={[0.46, 2]} rotation={[0.2, 0.3, 0.1]}>
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.52} blending={THREE.AdditiveBlending} />
      </Octahedron>
      <Octahedron args={[0.28, 1]} rotation={[0.4, -0.2, 0.6]}>
        <meshBasicMaterial color={WHITE} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </Octahedron>
      <mesh>
        <sphereGeometry args={[0.15, 20, 20]} />
        <meshBasicMaterial color={WHITE} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function CoreOrbits({ isMobile }) {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.12;
  });

  return (
    <group ref={group} rotation={[0.9, 0.12, 0.3]}>
      <Torus args={[0.67, 0.008, 6, 100]}>
        <meshBasicMaterial color={CYAN} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
      </Torus>
      <Torus args={[0.84, 0.004, 6, 100]} rotation={[0.4, 0.7, 0.2]}>
        <meshBasicMaterial color={VIOLET} transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </Torus>
      {!isMobile && (
        <Arc radius={0.98} color={WHITE} rotation={[0.2, 0.7, 0.5]} start={0.35} end={2.25} opacity={0.22} width={0.8} />
      )}
    </group>
  );
}

function DataSpokes({ isMobile }) {
  const group = useRef();
  const spokes = useMemo(() => {
    const count = isMobile ? 5 : 8;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + 0.2;
      const r1 = 1.56;
      const r2 = 1.82 + (i % 2) * 0.08;
      return {
        points: [
          [Math.cos(a) * r1, Math.sin(a) * r1, 0],
          [Math.cos(a) * r2, Math.sin(a) * r2, 0],
        ],
        rotation: [0.38 + (i % 2) * 0.2, 0.16, a * 0.12],
      };
    });
  }, [isMobile]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z -= delta * 0.025;
  });

  return (
    <group ref={group} rotation={[0.3, -0.2, 0.2]}>
      {spokes.map((s, i) => (
        <Line key={i} points={s.points} color={i % 2 ? VIOLET : CYAN} lineWidth={0.65} transparent opacity={0.18} rotation={s.rotation} />
      ))}
    </group>
  );
}

export default function EnergyCore({ mouseRef, isMobile = false }) {
  const planet = useRef();
  const atmosphere = useRef();
  const shell = useRef();
  const halo = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { x, y } = mouseRef.current;
    const ease = 1 - Math.pow(0.001, delta);

    if (planet.current) {
      const targetY = x * 0.95 + t * 0.065;
      const targetX = -y * 0.48;
      planet.current.rotation.y = THREE.MathUtils.lerp(planet.current.rotation.y, targetY, ease * 0.8);
      planet.current.rotation.x = THREE.MathUtils.lerp(planet.current.rotation.x, targetX, ease * 0.8);
      planet.current.rotation.z = THREE.MathUtils.lerp(planet.current.rotation.z, x * 0.05, ease * 0.5);
    }

    if (atmosphere.current) {
      const pulse = 1 + Math.sin(t * 0.85) * 0.016;
      atmosphere.current.scale.setScalar(pulse);
    }

    if (shell.current) {
      shell.current.rotation.y -= delta * 0.025;
      shell.current.rotation.x += delta * 0.008;
    }

    if (halo.current) {
      halo.current.rotation.y += delta * 0.035;
      halo.current.rotation.z -= delta * 0.022;
    }
  });

  return (
    <group ref={planet}>
      <mesh ref={atmosphere}>
        <sphereGeometry args={[1.79, isMobile ? 24 : 36, isMobile ? 16 : 24]} />
        <meshBasicMaterial color={VIOLET} transparent opacity={0.045} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.65, isMobile ? 24 : 36, isMobile ? 18 : 24]} />
        <meshPhysicalMaterial
          color="#06101d"
          roughness={0.28}
          metalness={0.35}
          transmission={0.12}
          thickness={0.3}
          transparent
          opacity={0.58}
          emissive="#10143d"
          emissiveIntensity={0.35}
          depthWrite={false}
        />
      </mesh>

      <group ref={shell}>
        <Icosahedron args={[1.67, 2]} rotation={[0.18, 0.25, 0.05]}>
          <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.16} blending={THREE.AdditiveBlending} />
        </Icosahedron>
        <Icosahedron args={[1.71, 1]} rotation={[-0.22, 0.6, 0.2]}>
          <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.22} blending={THREE.AdditiveBlending} />
        </Icosahedron>
      </group>

      <SurfaceNodes isMobile={isMobile} />
      <EnergyParticles isMobile={isMobile} />
      <CoreOrbits isMobile={isMobile} />
      <DataSpokes isMobile={isMobile} />
      <CoreEngine />

      <group ref={halo}>
        <Torus args={[1.91, 0.005, 6, 140]} rotation={[1.16, 0.16, 0.1]}>
          <meshBasicMaterial color={CYAN} transparent opacity={0.16} blending={THREE.AdditiveBlending} />
        </Torus>
        <Arc radius={1.94} color={VIOLET} rotation={[0.8, -0.2, 0.3]} start={-0.9} end={1.15} opacity={0.35} width={1.05} />
        <Arc radius={1.94} color={CYAN} rotation={[-0.35, 0.5, -0.15]} start={2.2} end={4.15} opacity={0.28} width={0.9} />
      </group>
    </group>
  );
}
