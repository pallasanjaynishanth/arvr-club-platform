import { useRef } from 'react'
import { Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import usePointer from '../hooks/usePointer'

function MovingStars() {
  const group = useRef()
  const pointer = usePointer()

  useFrame(() => {
    if (!group.current) return

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      pointer.current.y * 0.035,
      0.02
    )

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      pointer.current.x * 0.05,
      0.02
    )
  })

  return (
    <group ref={group}>
      <Stars
        radius={90}
        depth={60}
        count={3500}
        factor={3}
        saturation={0}
        fade
        speed={0.35}
      />
    </group>
  )
}

export default MovingStars
