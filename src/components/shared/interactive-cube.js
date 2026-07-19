import React, { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { BoxGeometry, EdgesGeometry } from "three"

// Translucent dark faces so the particle field shows through,
// theme-teal edges that flare purple on hover.
const Cube = () => {
  const groupRef = useRef()
  const drag = useRef({ active: false, x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(1.4, 1.4, 1.4)), [])

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    if (!drag.current.active) {
      // idle spin — resumes on its own after a drag
      g.rotation.x += delta * 0.25
      g.rotation.y += delta * 0.35
    }
    // gentle float
    g.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08
    // ease toward hover scale
    const target = hovered ? 1.12 : 1
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * Math.min(1, delta * 8))
  })

  const onPointerDown = (e) => {
    e.stopPropagation()
    drag.current = { active: true, x: e.clientX, y: e.clientY }
    e.target.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const g = groupRef.current
    g.rotation.y += (e.clientX - drag.current.x) * 0.01
    g.rotation.x += (e.clientY - drag.current.y) * 0.01
    drag.current.x = e.clientX
    drag.current.y = e.clientY
  }

  const endDrag = (e) => {
    drag.current.active = false
    if (e.target.hasPointerCapture?.(e.pointerId)) e.target.releasePointerCapture(e.pointerId)
  }

  return (
    <group ref={groupRef}>
      <mesh
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial
          color="#0f1419"
          metalness={0.65}
          roughness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={hovered ? "#7c4dff" : "#00bcd4"} />
      </lineSegments>
    </group>
  )
}

const InteractiveCube = () => (
  <div
    className="w-20 h-20 md:w-24 md:h-24"
    style={{ cursor: "grab" }}
    role="img"
    aria-label="Interactive cube — drag to rotate"
  >
    <Canvas
      camera={{ position: [2.4, 2.2, 2.4], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1.1} color="#00e5ff" />
      <pointLight position={[-5, -4, -5]} intensity={0.6} color="#7c4dff" />
      <Cube />
    </Canvas>
  </div>
)

export default InteractiveCube
