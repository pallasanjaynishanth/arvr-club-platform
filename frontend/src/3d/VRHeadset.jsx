import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Standalone futuristic VR headset, built from primitive geometry.
 *
 * Used as a fallback when the loaded human GLB doesn't already include
 * a headset mesh. Position/scale it to sit over the placeholder's face.
 */
function VRHeadset({ position = [0, 0, 0], scale = 1 }) {
  const strip = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (strip.current) {
      // gentle emissive pulse so the strips feel powered, not static
      strip.current.material.emissiveIntensity = 1.6 + Math.sin(t * 2) * 0.35
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* dark metallic main body */}
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.32, 0.34]} />
        <meshStandardMaterial
          color="#0a0a12"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* front visor / glass */}
      <mesh position={[0, 0, 0.175]}>
        <boxGeometry args={[0.5, 0.2, 0.02]} />
        <meshPhysicalMaterial
          color="#0e0e18"
          metalness={0.2}
          roughness={0.05}
          transmission={0.4}
          thickness={0.3}
          clearcoat={1}
        />
      </mesh>

      {/* emissive purple light strip along the front edge */}
      <mesh ref={strip} position={[0, 0.09, 0.176]}>
        <boxGeometry args={[0.52, 0.02, 0.01]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* cyan accent strip */}
      <mesh position={[0, -0.1, 0.176]}>
        <boxGeometry args={[0.52, 0.012, 0.01]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* side straps */}
      <mesh position={[0.34, 0, -0.05]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.22, 0.06]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-0.34, 0, -0.05]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.08, 0.22, 0.06]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  )
}

export default VRHeadset
