import { useMemo } from 'react'
import { useControls } from 'leva'
import {
  createDefaultParams,
  selectSetMany,
  selectSetParam,
  useTowerControls,
  type TowerParams,
} from '../state/useTowerControls'

const toControlValues = (params: TowerParams) => ({
  floors: params.floors,
  totalHeight: params.totalHeight,
  baseRadius: params.baseRadius,
  twistMin: params.twistMin,
  twistMax: params.twistMax,
  scaleMin: params.scaleMin,
  scaleMax: params.scaleMax,
  gradientMode: params.gradientMode,
  colorStart: params.colorStart,
  colorEnd: params.colorEnd,
})

export const ControlsPanel = () => {
  const setParam = useTowerControls(selectSetParam)
  const setMany = useTowerControls(selectSetMany)
  const defaults = useMemo(() => createDefaultParams(), [])

  const controlSchema = () => ({
    floors: {
      label: 'Floors',
      value: defaults.floors,
      min: 5,
      max: 220,
      step: 1,
      onChange: (value: number) => setParam('floors', Math.round(value)),
    },
    totalHeight: {
      label: 'Total Height',
      value: defaults.totalHeight,
      min: 40,
      max: 400,
      step: 1,
      onChange: (value: number) => setParam('totalHeight', value),
    },
    baseRadius: {
      label: 'Base Radius',
      value: defaults.baseRadius,
      min: 2,
      max: 20,
      step: 0.1,
      onChange: (value: number) => setParam('baseRadius', value),
    },
    twistMin: {
      label: 'Twist Min (deg)',
      value: defaults.twistMin,
      min: -360,
      max: 0,
      step: 1,
      onChange: (value: number) => setParam('twistMin', value),
    },
    twistMax: {
      label: 'Twist Max (deg)',
      value: defaults.twistMax,
      min: 0,
      max: 720,
      step: 1,
      onChange: (value: number) => setParam('twistMax', value),
    },
    scaleMin: {
      label: 'Scale Min',
      value: defaults.scaleMin,
      min: 0.1,
      max: 1.5,
      step: 0.01,
      onChange: (value: number) => setParam('scaleMin', value),
    },
    scaleMax: {
      label: 'Scale Max',
      value: defaults.scaleMax,
      min: 0.2,
      max: 2.2,
      step: 0.01,
      onChange: (value: number) => setParam('scaleMax', value),
    },
    gradientMode: {
      label: 'Gradient Mode',
      value: defaults.gradientMode,
      options: {
        Linear: 'linear',
        'Ease In': 'easeIn',
        'Ease Out': 'easeOut',
      },
      onChange: (value: TowerParams['gradientMode']) => setParam('gradientMode', value),
    },
    colorStart: {
      label: 'Bottom Color',
      value: defaults.colorStart,
      onChange: (value: string) => setParam('colorStart', value),
    },
    colorEnd: {
      label: 'Top Color',
      value: defaults.colorEnd,
      onChange: (value: string) => setParam('colorEnd', value),
    },
  })

  const [, setControlValues] = useControls(controlSchema, { collapsed: false }, [])

  const handleReset = () => {
    const resetValues = createDefaultParams()
    setMany(resetValues)
    setControlValues(toControlValues(resetValues))
  }

  return (
    <div className="controls-panel">
      <h2>Parametric Tower Pilot</h2>
      <p>
        Use the floating slider stack to sculpt the tower. Floors, twists, scales, and colors all update live in the
        viewport.
      </p>
      <button className="controls-panel__reset" onClick={handleReset}>
        Reset to defaults
      </button>
      <small>Tip: orbit with left-drag, pan with right-drag, zoom with the wheel.</small>
    </div>
  )
}
