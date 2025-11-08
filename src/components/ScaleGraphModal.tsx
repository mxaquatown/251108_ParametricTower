import { useEffect, useMemo, useRef, useState } from 'react'
import type { BezierPoint } from '../state/useTowerControls'

type Props = {
  open: boolean
  value: { p1: BezierPoint; p2: BezierPoint }
  onChange: (value: { p1: BezierPoint; p2: BezierPoint }) => void
  onClose: () => void
}

const clampPoint = (point: BezierPoint): BezierPoint => ({
  x: Math.min(1, Math.max(0, point.x)),
  y: Math.min(1, Math.max(0, point.y)),
})

export const ScaleGraphModal = ({ open, value, onChange, onClose }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<null | 'p1' | 'p2'>(null)
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 140 })
  const [isMoving, setIsMoving] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleUp = () => setDragging(null)
    const handleLeave = () => setDragging(null)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  const size = 220
  const padding = 16
  const innerSize = size - padding * 2

  const svgPoints = useMemo(() => {
    const toSvg = (point: BezierPoint) => ({
      x: padding + point.x * innerSize,
      y: padding + (1 - point.y) * innerSize,
    })
    return {
      start: { x: padding, y: size - padding },
      end: { x: size - padding, y: padding },
      p1: toSvg(value.p1),
      p2: toSvg(value.p2),
    }
  }, [value, innerSize, padding, size])

  const handleMouseDown = (handle: 'p1' | 'p2') => (event: React.MouseEvent) => {
    event.preventDefault()
    setDragging(handle)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left - padding) / innerSize
    const y = 1 - (event.clientY - rect.top - padding) / innerSize
    const nextPoint = clampPoint({ x, y })
    onChange({
      ...value,
      [dragging]: nextPoint,
    })
  }

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!isMoving) return
      setPosition({
        x: event.clientX - dragOffset.current.x,
        y: event.clientY - dragOffset.current.y,
      })
    }
    const handleUp = () => setIsMoving(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isMoving])

  const startWindowDrag = (event: React.MouseEvent) => {
    event.preventDefault()
    dragOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    }
    setIsMoving(true)
  }

  if (!open) return null

  return (
    <div className="scale-graph-modal">
      <div className="scale-graph-modal__backdrop" onClick={onClose} />
      <div
        className="scale-graph-modal__panel"
        style={{ left: `${position.x}px`, top: `${position.y}px`, width: size + 16 }}
      >
        <header onMouseDown={startWindowDrag}>
          <span>Scale Gradient Graph</span>
          <button type="button" onClick={onClose} aria-label="Close graph">
            ×
          </button>
        </header>
        <svg
          width={size}
          height={size}
          ref={svgRef}
          onMouseMove={handleMouseMove}
          className="scale-graph-modal__svg"
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#8e94aa" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={size} height={size} fill="#f0f2f8" stroke="#515561" strokeWidth="1.5" rx="10" />
          <rect
            x={padding}
            y={padding}
            width={innerSize}
            height={innerSize}
            fill="url(#grid)"
            stroke="#c7ccdc"
          />
          <path
            d={`M ${svgPoints.start.x} ${svgPoints.start.y} C ${svgPoints.p1.x} ${svgPoints.p1.y} ${svgPoints.p2.x} ${svgPoints.p2.y} ${svgPoints.end.x} ${svgPoints.end.y}`}
            fill="none"
            stroke="#111319"
            strokeWidth="3"
          />
          {(['start', 'end'] as const).map((key) => {
            const point = svgPoints[key]
            return <circle key={key} cx={point.x} cy={point.y} r={5} fill="#111319" />
          })}

          {(['p1', 'p2'] as const).map((key) => {
            const point = svgPoints[key]
            const anchor = key === 'p1' ? svgPoints.start : svgPoints.end
            return (
              <g key={key}>
                <line x1={anchor.x} y1={anchor.y} x2={point.x} y2={point.y} stroke="#c2475a" strokeWidth="1.5" />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={7}
                  fill="#fff"
                  stroke={dragging === key ? '#ffb347' : '#22263a'}
                  strokeWidth="2"
                  onMouseDown={handleMouseDown(key)}
                />
              </g>
            )
          })}
        </svg>
        <p>
          Control points: P1 ({value.p1.x.toFixed(2)}, {value.p1.y.toFixed(2)}) · P2 ({value.p2.x.toFixed(2)},{' '}
          {value.p2.y.toFixed(2)})
        </p>
      </div>
    </div>
  )
}
