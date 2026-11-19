import React, { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  BoxGeometry,
  CanvasTexture,
  EdgesGeometry,
  Matrix4,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from "three"

// A die for the whole site. Click it and it tumbles, then settles on one
// face; the face on top is a page, and the label under the die links there.
// Faces follow three.js BoxGeometry material order: +x, -x, +y, -y, +z, -z.
export const FACES = [
  { label: "Kings Blood", href: "/kings-blood.html", glyph: "crown" },
  { label: "Crack in the Veil", href: "/crack-in-the-veil.html", glyph: "crack" },
  { label: "Convergence", href: "/convergence", glyph: "spiral" },
  { label: "Chroma Echo", href: "/apps/Chroma_Echo.html", glyph: "wave" },
  { label: "Voltic Pile", href: "/apps/voltic_pile.html", glyph: "pile" },
  { label: "Hypersphere", href: "/apps/sphere_cylinder_hypersphere.html", glyph: "sphere" },
]

// Local frame of each face: outward normal and the direction its text reads "up".
const FACE_FRAMES = [
  { n: [1, 0, 0], up: [0, 1, 0] },
  { n: [-1, 0, 0], up: [0, 1, 0] },
  { n: [0, 1, 0], up: [0, 0, -1] },
  { n: [0, -1, 0], up: [0, 0, 1] },
  { n: [0, 0, 1], up: [0, 1, 0] },
  { n: [0, 0, -1], up: [0, 1, 0] },
]

const CAMERA = new Vector3(2.4, 2.2, 2.4)
const SEEN_KEY = "djc-die-seen"

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// Rotation that brings face `i` square to the camera, text upright on screen.
const faceQuaternion = (i) => {
  const d = CAMERA.clone().normalize()
  const up = new Vector3(0, 1, 0)
  const u = up.sub(d.clone().multiplyScalar(d.dot(up))).normalize()
  const r = new Vector3().crossVectors(u, d)
  const { n, up: fu } = FACE_FRAMES[i]
  const ln = new Vector3(...n)
  const lu = new Vector3(...fu)
  const lr = new Vector3().crossVectors(lu, ln)
  const local = new Matrix4().makeBasis(lr, lu, ln)
  const world = new Matrix4().makeBasis(r, u, d)
  return new Quaternion().setFromRotationMatrix(world.multiply(local.transpose()))
}

const readSeen = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SEEN_KEY) || "[]")
  } catch {
    return []
  }
}

const writeSeen = (seen) => {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {
    /* storage unavailable: the die still works */
  }
}

// Random face, never the one just shown, favouring pages not yet visited.
const pickFace = (last) => {
  const seen = readSeen()
  const weights = FACES.map((_, i) => (i === last ? 0 : seen.includes(i) ? 1 : 3))
  let roll = Math.random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return i
  }
  return (last + 1) % FACES.length
}

const drawGlyph = (ctx, glyph) => {
  ctx.save()
  ctx.translate(128, 104)
  ctx.strokeStyle = "#00e5ff"
  ctx.lineWidth = 9
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()
  switch (glyph) {
    case "crown":
      ctx.moveTo(-58, 38)
      ctx.lineTo(-64, -34)
      ctx.lineTo(-30, 0)
      ctx.lineTo(0, -48)
      ctx.lineTo(30, 0)
      ctx.lineTo(64, -34)
      ctx.lineTo(58, 38)
      ctx.closePath()
      break
    case "crack":
      ctx.moveTo(-6, -58)
      ctx.lineTo(14, -22)
      ctx.lineTo(-18, 2)
      ctx.lineTo(10, 28)
      ctx.lineTo(-4, 58)
      break
    case "spiral":
      for (let a = 0; a < Math.PI * 6; a += 0.12) {
        const r = 4 + a * 3.1
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (a === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      break
    case "wave":
      for (let x = -62; x <= 62; x += 3) {
        const y = Math.sin(x * 0.09) * 30
        if (x === -62) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      break
    case "pile":
      for (const y of [-34, 0, 34]) {
        ctx.moveTo(-52, y)
        ctx.lineTo(52, y)
      }
      break
    case "sphere":
      ctx.arc(0, 0, 54, 0, Math.PI * 2)
      ctx.moveTo(54, 0)
      ctx.ellipse(0, 0, 54, 20, 0, 0, Math.PI * 2)
      ctx.moveTo(20, 0)
      ctx.ellipse(0, 0, 20, 54, 0, 0, Math.PI * 2)
      break
    default:
      break
  }
  ctx.stroke()
  ctx.restore()
}

const paintFace = (canvas, face) => {
  const ctx = canvas.getContext("2d")
  ctx.fillStyle = "#0f1419"
  ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = "rgba(0, 188, 212, 0.35)"
  ctx.lineWidth = 3
  ctx.strokeRect(10, 10, 236, 236)
  drawGlyph(ctx, face.glyph)
  ctx.fillStyle = "#ffffff"
  ctx.font = "600 25px 'Space Grotesk', sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(face.label.toUpperCase(), 128, 214, 216)
}

const useFaceTextures = () => {
  const textures = useMemo(
    () =>
      FACES.map((face) => {
        const canvas = document.createElement("canvas")
        canvas.width = 256
        canvas.height = 256
        paintFace(canvas, face)
        const texture = new CanvasTexture(canvas)
        texture.colorSpace = SRGBColorSpace
        texture.anisotropy = 4
        return { texture, canvas, face }
      }),
    []
  )

  // Repaint once the label font is available so the first frame is not a fallback face.
  useEffect(() => {
    let live = true
    document.fonts?.load("600 25px 'Space Grotesk'").then(() => {
      if (!live) return
      textures.forEach(({ canvas, face, texture }) => {
        paintFace(canvas, face)
        texture.needsUpdate = true
      })
    })
    return () => {
      live = false
      textures.forEach(({ texture }) => texture.dispose())
    }
  }, [textures])

  return textures
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3)

const Cube = ({ rollTick, onRollStart, onSettled, onActivate }) => {
  const reduceMotion = useMemo(prefersReducedMotion, [])
  const faces = useFaceTextures()
  const groupRef = useRef()
  const drag = useRef({ active: false, x: 0, y: 0, moved: 0, at: 0 })
  const roll = useRef(null)
  const settled = useRef(null)
  const [hovered, setHovered] = useState(false)

  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(1.4, 1.4, 1.4)), [])

  const startRoll = () => {
    const g = groupRef.current
    if (!g || roll.current) return
    const target = pickFace(settled.current ?? -1)
    const qTo = faceQuaternion(target)
    onRollStart?.()
    if (reduceMotion) {
      g.quaternion.copy(qTo)
      settled.current = target
      onSettled?.(target)
      return
    }
    roll.current = {
      t: 0,
      dur: 1.7,
      from: g.quaternion.clone(),
      to: qTo,
      axis: new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      spin: Math.PI * 2 * (2 + Math.random() * 1.5),
      target,
    }
    settled.current = null
  }

  // Parent-triggered roll (keyboard / label button).
  const lastTick = useRef(rollTick)
  useEffect(() => {
    if (rollTick !== lastTick.current) {
      lastTick.current = rollTick
      startRoll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollTick])

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    const r = roll.current
    if (r) {
      r.t = Math.min(1, r.t + delta / r.dur)
      const e = easeOut(r.t)
      g.quaternion.copy(r.from).slerp(r.to, e)
      g.quaternion.premultiply(new Quaternion().setFromAxisAngle(r.axis, (1 - e) * r.spin))
      g.position.y = Math.sin(Math.PI * r.t) * 0.45
      if (r.t >= 1) {
        g.quaternion.copy(r.to)
        settled.current = r.target
        roll.current = null
        onSettled?.(r.target)
      }
    } else {
      if (settled.current === null && !drag.current.active && !reduceMotion) {
        // idle spin: resumes on its own after a drag
        g.rotation.x += delta * 0.25
        g.rotation.y += delta * 0.35
      }
      g.position.y = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.2) * 0.06
    }
    const target = hovered ? 1.1 : 1
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * Math.min(1, delta * 8))
  })

  const onPointerDown = (e) => {
    e.stopPropagation()
    drag.current = { active: true, x: e.clientX, y: e.clientY, moved: 0, at: performance.now() }
    e.target.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drag.current.active || roll.current) return
    const g = groupRef.current
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    drag.current.moved += Math.abs(dx) + Math.abs(dy)
    if (drag.current.moved > 6) settled.current = null
    g.rotation.y += dx * 0.01
    g.rotation.x += dy * 0.01
    drag.current.x = e.clientX
    drag.current.y = e.clientY
  }

  const endDrag = (e) => {
    const { moved, at } = drag.current
    drag.current.active = false
    if (e.target.hasPointerCapture?.(e.pointerId)) e.target.releasePointerCapture(e.pointerId)
    const isClick = moved < 6 && performance.now() - at < 500
    if (!isClick || roll.current) return
    if (settled.current !== null) onActivate?.(settled.current)
    else startRoll()
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
        {faces.map(({ texture, face }, i) => (
          <meshBasicMaterial
            key={face.label}
            attach={`material-${i}`}
            map={texture}
            transparent
            opacity={0.94}
            toneMapped={false}
          />
        ))}
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={hovered ? "#7c4dff" : "#00bcd4"} />
      </lineSegments>
    </group>
  )
}

const InteractiveCube = () => {
  const [rollTick, setRollTick] = useState(0)
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState(null)

  const handleSettled = (index) => {
    setRolling(false)
    setResult(index)
    const seen = readSeen()
    if (!seen.includes(index)) writeSeen([...seen, index])
  }

  const go = (index) => {
    window.location.assign(FACES[index].href)
  }

  const face = result !== null ? FACES[result] : null

  return (
    <div className="die" role="group" aria-label="Page die">
      <div
        className="w-20 h-20 md:w-40 md:h-40"
        style={{ cursor: "pointer" }}
        aria-hidden="true"
      >
        <Canvas
          camera={{ position: CAMERA.toArray(), fov: 40 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Cube
            rollTick={rollTick}
            onRollStart={() => { setRolling(true); setResult(null) }}
            onSettled={handleSettled}
            onActivate={go}
          />
        </Canvas>
      </div>
      <div className="die-controls" aria-live="polite">
        {face && !rolling ? (
          <>
            <a href={face.href} className="die-control die-link">
              {face.label} <span aria-hidden="true">&rarr;</span>
            </a>
            <button type="button" className="die-control die-again" onClick={() => setRollTick((n) => n + 1)}>
              Roll again
            </button>
          </>
        ) : (
          <button
            type="button"
            className="die-control"
            disabled={rolling}
            onClick={() => setRollTick((n) => n + 1)}
          >
            {rolling ? "Rolling" : "Roll the die"}
          </button>
        )}
      </div>
    </div>
  )
}

export default InteractiveCube
