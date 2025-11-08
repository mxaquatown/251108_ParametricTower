import { useEffect, useMemo, useRef, useState } from 'react'
import { button, folder, useControls } from 'leva'
import {
  createDefaultParams,
  selectParams,
  selectSetMany,
  selectSetParam,
  useTowerControls,
  type TowerParams,
} from '../state/useTowerControls'
import { exportTowerToOBJ } from '../utils/exporters'
import { ScaleGraphModal } from './ScaleGraphModal'

const toControlValues = (params: TowerParams) => ({
  floors: params.floors,
  floorSpacing: params.floorSpacing,
  baseRadius: params.baseRadius,
  slabThickness: params.slabThickness,
  floorSides: params.floorSides,
  autoRotate: params.autoRotate,
  twistMin: params.twistMin,
  twistMax: params.twistMax,
  scaleMin: params.scaleMin,
  scaleMax: params.scaleMax,
  twistGradient: params.twistGradient,
  scaleGradient: params.scaleGradient,
  colorStart: params.colorStart,
  colorEnd: params.colorEnd,
})

export const ControlsPanel = () => {
  const setParam = useTowerControls(selectSetParam)
  const setMany = useTowerControls(selectSetMany)
  const params = useTowerControls(selectParams)
  const defaults = useMemo(() => createDefaultParams(), [])
  const paramsRef = useRef(params)
  const controlSetterRef = useRef<((values: Record<string, unknown>) => void) | null>(null)
  const [graphOpen, setGraphOpen] = useState(false)

  useEffect(() => {
    paramsRef.current = params
  }, [params])

  const syncControls = (values: TowerParams) => {
    controlSetterRef.current?.(toControlValues(values))
  }

  const handleReset = () => {
    const resetValues = createDefaultParams()
    setMany(resetValues)
    syncControls(resetValues)
  }

  const handleExportOBJ = () => {
    exportTowerToOBJ(paramsRef.current)
  }

  const handleGraphChange = (next: TowerParams['scaleGraph']) => {
    setParam('scaleGraph', next)
  }

  const [, setControlValues] = useControls(
    () => ({
      Structure: folder(
        {
    floors: {
      label: 'Floors',
      value: defaults.floors,
      min: 5,
      max: 50,
      step: 1,
      onChange: (value: number) => setParam('floors', Math.round(value)),
    },
    floorSpacing: {
      label: 'Floor Spacing',
      value: defaults.floorSpacing,
      min: 1,
      max: 3,
      step: 0.1,
      onChange: (value: number) => setParam('floorSpacing', value),
    },
          baseRadius: {
            label: 'Base Radius',
            value: defaults.baseRadius,
            min: 2,
            max: 20,
            step: 0.1,
            onChange: (value: number) => setParam('baseRadius', value),
          },
    slabThickness: {
      label: 'Slab Thickness',
      value: defaults.slabThickness,
      min: 0.2,
      max: 1,
      step: 0.05,
      onChange: (value: number) => setParam('slabThickness', value),
    },
          floorSides: {
            label: 'Sides Per Floor',
            value: defaults.floorSides,
            min: 3,
            max: 10,
            step: 1,
            onChange: (value: number) => setParam('floorSides', Math.round(value)),
          },
        },
        { collapsed: false },
      ),
      Gradients: folder(
        {
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
          twistGradient: {
            label: 'Twist Gradient',
            value: defaults.twistGradient,
            options: {
              Linear: 'linear',
              'Ease In': 'easeIn',
              'Ease Out': 'easeOut',
              'Ease In-Out': 'easeInOut',
            },
            onChange: (value: TowerParams['twistGradient']) => setParam('twistGradient', value),
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
            max: 10,
            step: 0.01,
            onChange: (value: number) => setParam('scaleMax', value),
          },
          scaleGradient: {
            label: 'Scale Gradient',
            value: defaults.scaleGradient,
            options: {
              Linear: 'linear',
              'Ease In': 'easeIn',
              'Ease Out': 'easeOut',
              'Ease In-Out': 'easeInOut',
            },
            onChange: (value: TowerParams['scaleGradient']) => setParam('scaleGradient', value),
          },
          scaleGraphEnabled: {
            label: 'Use Graph',
            value: defaults.scaleGraphEnabled,
            onChange: (value: boolean) => setParam('scaleGraphEnabled', value),
          },
          'Edit Graph': button(() => {
            if (!paramsRef.current.scaleGraphEnabled) {
              setParam('scaleGraphEnabled', true)
            }
            setGraphOpen(true)
          }),
        },
        { collapsed: true },
      ),
      Display: folder(
        {
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
          autoRotate: {
            label: 'Auto Rotate',
            value: defaults.autoRotate,
            onChange: (value: boolean) => setParam('autoRotate', value),
          },
        },
        { collapsed: true },
      ),
      Export: folder(
        {
          exportOBJ: button(() => handleExportOBJ()),
        },
        { collapsed: true },
      ),
    }),
    [],
  )

  useEffect(() => {
    controlSetterRef.current = setControlValues
  }, [setControlValues])

  return (
    <>
      <div className="controls-panel">
        <div className="controls-panel__content">
          <p className="hint">
            Sliders now live in grouped folders (Structure, Gradients, Display, Export) inside the Leva panel. Use the
            folders to sculpt form, then grab OBJs directly from Export.
          </p>
          <div className="controls-panel__actions">
            <button className="controls-panel__reset" onClick={handleReset}>
              Reset to defaults
            </button>
            <small>Orbit: left drag · Pan: right drag · Zoom: scroll</small>
          </div>
        </div>
      </div>
      <ScaleGraphModal
        open={graphOpen}
        value={params.scaleGraph}
        onClose={() => setGraphOpen(false)}
        onChange={handleGraphChange}
      />
    </>
  )
}
