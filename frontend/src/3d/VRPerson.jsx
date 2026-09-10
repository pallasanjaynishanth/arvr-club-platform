import { Suspense, useRef, Component } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import VRHeadset from './VRHeadset'
import usePointer from '../hooks/usePointer'
import scrollProgress from '../hooks/scrollProgress'

const MODEL_PATH = '/models/vr-person.glb'

/**
 * Catches useGLTF load failures (missing/broken GLB) so the whole app
 * doesn't crash. Suspense alone only covers the loading state, not a
 * genuine fetch error, so we need this too.
 */
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Swallow — this is an expected state until the real model is added.
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

/** Loads the real GLB once it exists at public/models/vr-person.glb */
function LoadedPerson({ groupRef }) {
  const { scene } = useGLTF(MODEL_PATH)
  return <primitive ref={groupRef} object={scene} />
}

/**
 * Stylized placeholder human — low-poly, wireframe-accented, built entirely
 * from primitives so the scene always renders even with zero assets.
 * Swap out automatically once vr-person.glb is present.
 */
function PlaceholderPerson({ groupRef }) {
  return (
    <group ref={groupRef}>
      {/* torso */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <capsuleGeometry args={[0.42, 0.9, 8, 16]} />
        <meshStandardMaterial
          color="#0c0c14"
          metalness={0.6}
          roughness={0.45}
        />
      </mesh>

      {/* torso wireframe overlay — subtle sci-fi structure lines */}
      <mesh position={[0, -0.55, 0]} scale={1.015}>
        <capsuleGeometry args={[0.42, 0.9, 8, 16]} />
        <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.18} />
      </mesh>

      {/* neck */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.16, 16]} />
        <meshStandardMaterial color="#0c0c14" metalness={0.6} roughness={0.45} />
      </mesh>

      {/* head */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color="#151520" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* headset sitting on the head */}
      <VRHeadset position={[0, 0.28, 0.08]} scale={1.05} />

      {/* shoulders / backpack strap hint */}
      <mesh position={[0, -0.05, -0.15]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.18]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* rim-light accent line down the front, echoes reference image */}
      <mesh position={[0.16, -0.5, 0.32]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.015, 1, 0.01]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.18, -0.5, 0.3]} rotation={[0, 0, -0.06]}>
        <boxGeometry args={[0.015, 1, 0.01]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/**
 * VRPerson — the main visual focus of the scene.
 *
 * Anchored in place; only rotates/tilts subtly toward the pointer and
 * scroll position. Never translates across the screen.
 */
function VRPerson({ position = [1.3, -0.4, 0] }) {
  const outerGroup = useRef()
  const innerGroup = useRef()
  const pointer = usePointer()

  useFrame(() => {
    if (!innerGroup.current) return

    const scroll = scrollProgress.value

    // subtle head/body turn toward the pointer — damped, never snappy
    const targetY = pointer.current.x * 0.35 + scroll * 0.6
    const targetX = pointer.current.y * 0.12 - scroll * 0.15

    innerGroup.current.rotation.y = THREE.MathUtils.lerp(
      innerGroup.current.rotation.y,
      targetY,
      0.045
    )
    innerGroup.current.rotation.x = THREE.MathUtils.lerp(
      innerGroup.current.rotation.x,
      targetX,
      0.045
    )

    // gentle idle bob so the figure feels alive without moving position
    const t = performance.now() * 0.0006
    innerGroup.current.position.y = Math.sin(t) * 0.045
  })

  return (
    <group ref={outerGroup} position={position} scale={1.35}>
      <group ref={innerGroup}>
        <ModelErrorBoundary
          fallback={<PlaceholderPerson groupRef={() => {}} />}
        >
          <Suspense fallback={<PlaceholderPerson groupRef={() => {}} />}>
            <LoadedPerson groupRef={() => {}} />
          </Suspense>
        </ModelErrorBoundary>
      </group>
    </group>
  )
}

// Pre-warm the loader; wrapped in try/catch since preload can reject
// immediately if the file doesn't exist yet — handled gracefully by the
// Suspense/ErrorBoundary pair above regardless.
try {
  useGLTF.preload(MODEL_PATH)
} catch (_err) {
  // no model yet — fallback placeholder will be used
}

export default VRPerson
