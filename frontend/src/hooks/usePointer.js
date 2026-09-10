import { useEffect, useRef } from 'react'

/**
 * Global normalized pointer position, shared across every 3D component.
 *
 * Uses window-level pointermove instead of R3F's state.mouse so that
 * HTML overlays (navbar, hero text, sections) sitting on top of the
 * fixed canvas never block the interaction.
 *
 * x, y are both in the range -1 to 1.
 * The ref is mutated in place (no re-renders) — read it inside useFrame.
 */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointerMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return pointer
}

export default usePointer
