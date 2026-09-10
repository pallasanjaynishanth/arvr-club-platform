/**
 * Minimal mutable singleton — GSAP ScrollTrigger writes to it on scroll,
 * 3D components read it inside useFrame. No re-renders, no extra deps.
 */
const scrollProgress = { value: 0 }

export default scrollProgress
