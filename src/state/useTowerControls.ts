import { create } from 'zustand'

export type GradientMode = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'

export type BezierPoint = {
  x: number
  y: number
}

export type TowerParams = {
  floors: number
  floorSpacing: number
  baseRadius: number
  slabThickness: number
  floorSides: number
  autoRotate: boolean
  twistMin: number
  twistMax: number
  twistGradient: GradientMode
  scaleMin: number
  scaleMax: number
  scaleGradient: GradientMode
  scaleGraphEnabled: boolean
  scaleGraph: {
    p1: BezierPoint
    p2: BezierPoint
  }
  colorStart: string
  colorEnd: string
}

type TowerStore = {
  params: TowerParams
  setParam: <K extends keyof TowerParams>(key: K, value: TowerParams[K]) => void
  setMany: (values: Partial<TowerParams>) => void
  reset: () => TowerParams
}

const baseDefaults: TowerParams = {
  floors: 48,
  floorSpacing: 3.2,
  baseRadius: 6,
  slabThickness: 1.1,
  floorSides: 3,
  autoRotate: false,
  twistMin: 0,
  twistMax: 260,
  twistGradient: 'linear',
  scaleMin: 0.4,
  scaleMax: 1,
  scaleGradient: 'easeOut',
  scaleGraphEnabled: false,
  scaleGraph: {
    p1: { x: 0.25, y: 0.05 },
    p2: { x: 0.75, y: 0.95 },
  },
  colorStart: '#03d7f2',
  colorEnd: '#f50ede',
}

export const createDefaultParams = (): TowerParams => ({
  ...baseDefaults,
})

export const useTowerControls = create<TowerStore>((set) => ({
  params: createDefaultParams(),
  setParam: (key, value) =>
    set((state) => ({
      params: {
        ...state.params,
        [key]: value,
      },
    })),
  setMany: (values) =>
    set((state) => ({
      params: {
        ...state.params,
        ...values,
      },
    })),
  reset: () => {
    const next = createDefaultParams()
    set({ params: next })
    return next
  },
}))

export const selectParams = (state: TowerStore) => state.params
export const selectSetParam = (state: TowerStore) => state.setParam
export const selectSetMany = (state: TowerStore) => state.setMany
