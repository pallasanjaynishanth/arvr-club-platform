import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'

function Stars() {
  const ref = useRef()
  const count = 650
  const positions = new Float32Array(count * 3)
  let seed = 19
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  for (let i = 0; i < count; i += 1) {
    const radius = 9 + rand() * 9
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(2 * rand() - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi)
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
  }

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.003
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#7bdfff" transparent opacity={0.58} depthWrite={false} />
    </points>
  )
}

function Orbit({ rotation, color, radius = 2.75 }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.025
  })

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, 0.012, 10, 160]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
    </mesh>
  )
}

function Planet() {
  const group = useRef()
  const drag = useRef({ active: false, x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const pointer = useRef({ x: 0, y: 0 })
  const { gl } = useThree()

  const [surface, lights] = useLoader(THREE.TextureLoader, [
    '/earth-surface.jpg',
    '/earth-lights.png',
  ])

  useEffect(() => {
    surface.colorSpace = THREE.SRGBColorSpace
    lights.colorSpace = THREE.SRGBColorSpace
    surface.anisotropy = gl.capabilities.getMaxAnisotropy()
    lights.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
  }, [gl, surface, lights])

  useEffect(() => {
    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    if (!group.current) return

    if (!drag.current.active) {
      target.current.x = pointer.current.x * 0.22
      target.current.y = pointer.current.y * 0.12
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, target.current.y, 2.4, delta)
      group.current.rotation.y += delta * 0.085
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        group.current.rotation.y + target.current.x * 0.001,
        1.2,
        delta,
      )
      group.current.rotation.y += velocity.current.x * delta
      group.current.rotation.x += velocity.current.y * delta
      velocity.current.x = THREE.MathUtils.damp(velocity.current.x, 0, 4.5, delta)
      velocity.current.y = THREE.MathUtils.damp(velocity.current.y, 0, 4.5, delta)
    } else {
      group.current.rotation.y += velocity.current.x * delta
      group.current.rotation.x += velocity.current.y * delta
    }
  })

  const beginDrag = (event) => {
    event.stopPropagation()
    drag.current.active = true
    drag.current.x = event.clientX
    drag.current.y = event.clientY
    velocity.current.x = 0
    velocity.current.y = 0
    gl.domElement.style.cursor = 'grabbing'
  }

  const moveDrag = (event) => {
    if (!drag.current.active) return
    event.stopPropagation()
    const dx = event.clientX - drag.current.x
    const dy = event.clientY - drag.current.y
    drag.current.x = event.clientX
    drag.current.y = event.clientY
    velocity.current.x = dx * 0.012
    velocity.current.y = dy * 0.008
    group.current.rotation.y += dx * 0.012
    group.current.rotation.x += dy * 0.008
    group.current.rotation.x = THREE.MathUtils.clamp(group.current.rotation.x, -0.55, 0.55)
  }

  const endDrag = () => {
    drag.current.active = false
    gl.domElement.style.cursor = 'default'
  }

  return (
    <group ref={group} position={[2.05, -0.05, 0]}>
      <mesh
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerOut={endDrag}
        onPointerCancel={endDrag}
      >
        <sphereGeometry args={[2.48, 96, 96]} />
        <meshStandardMaterial
          map={surface}
          roughness={0.78}
          metalness={0.08}
          emissiveMap={lights}
          emissive="#d9a05b"
          emissiveIntensity={0.72}
        />
      </mesh>

      <mesh scale={1.012}>
        <sphereGeometry args={[2.48, 64, 64]} />
        <meshBasicMaterial color="#27bfff" transparent opacity={0.055} wireframe />
      </mesh>

      <mesh scale={1.035}>
        <sphereGeometry args={[2.48, 64, 64]} />
        <meshBasicMaterial color="#35dfff" transparent opacity={0.16} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <Orbit rotation={[0.32, 0.1, -0.15]} color="#18dfff" radius={2.72} />
      <Orbit rotation={[-0.28, 0.65, 0.22]} color="#b56cff" radius={2.9} />
      <Orbit rotation={[1.15, -0.45, 0.15]} color="#6a8dff" radius={3.04} />
    </group>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#02050b']} />
      <ambientLight intensity={0.48} />
      <directionalLight position={[-3, 4, 5]} intensity={2.1} color="#b8dcff" />
      <pointLight position={[4, 1, 4]} intensity={6} distance={12} color="#1cdfff" />
      <pointLight position={[-4, 1, 2]} intensity={5} distance={10} color="#7c4dff" />
      <Stars />
      <Suspense fallback={null}>
        <Planet />
      </Suspense>
    </>
  )
}

export default function EarthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.4], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <Scene />
    </Canvas>
  )
}
