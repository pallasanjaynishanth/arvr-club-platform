import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import EnergyCore from './EnergyCore';
import HolographicRings from './HolographicRings';
import Particles from './Particles';

function CameraRig({ mouseRef, isMobile }) {
  const { camera } = useThree();
  const smooth = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const raw = mouseRef.current;
    const ease = 1 - Math.pow(0.001, delta);
    smooth.current.x = THREE.MathUtils.lerp(smooth.current.x, raw.x, ease * 0.65);
    smooth.current.y = THREE.MathUtils.lerp(smooth.current.y, raw.y, ease * 0.65);

    const depth = isMobile ? 0.08 : 0.14;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, smooth.current.x * depth, ease * 0.45);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -smooth.current.y * depth * 0.45, ease * 0.45);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7.8, ease * 0.65);
    camera.lookAt(0.72, 0, 0);
  });

  return null;
}

function SceneContents({ mouseRef, isMobile }) {
  return (
    <>
      <CameraRig mouseRef={mouseRef} isMobile={isMobile} />
      <fog attach="fog" args={['#03040a', 8, 20]} />

      <ambientLight intensity={0.045} />
      <pointLight position={[3.8, 2.2, 4]} intensity={1.45} color="#6d5dfc" />
      <pointLight position={[-2.8, -1.2, 2.5]} intensity={0.85} color="#22d3ee" />
      <pointLight position={[0.5, 0.2, 2]} intensity={0.5} color="#ffffff" />

      <group position={[1.82, 0.02, 0]} scale={isMobile ? 0.78 : 1.08}>
        <EnergyCore mouseRef={mouseRef} isMobile={isMobile} />
        <HolographicRings mouseRef={mouseRef} />
      </group>

      <Particles mouseRef={mouseRef} isMobile={isMobile} />
    </>
  );
}

export default function Scene() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 760,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 760);
    const onPointerMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <Canvas
      dpr={isMobile ? [1, 1.25] : [1, 1.55]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#030409', 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.72;
      }}
      camera={{ position: [0, 0, 7.8], fov: 42 }}
      style={{ width: '100%', height: '100%', display: 'block', background: '#030409' }}
    >
      <Suspense fallback={null}>
        <SceneContents mouseRef={mouseRef} isMobile={isMobile} />
      </Suspense>

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={isMobile ? 0.32 : 0.5}
          luminanceThreshold={0.36}
          luminanceSmoothing={0.76}
          mipmapBlur
        />
        {!isMobile && <Vignette eskil={false} offset={0.22} darkness={0.68} />}
      </EffectComposer>
    </Canvas>
  );
}
