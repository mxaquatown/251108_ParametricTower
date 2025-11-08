import * as THREE from 'three'
import chroma from 'chroma-js'
import type { GradientMode, TowerParams } from '../state/useTowerControls'

const easingMap: Record<GradientMode, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 2),
}

const tempMatrix = new THREE.Matrix4()
const tempPosition = new THREE.Vector3()
const tempQuaternion = new THREE.Quaternion()
const tempScale = new THREE.Vector3()
const euler = new THREE.Euler()

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const createBaseGeometry = () =>
  new THREE.CylinderGeometry(1, 1, 1, 48, 1, false, 0, Math.PI * 2)

const createMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.65,
    metalness: 0.15,
  })

export const createTowerMesh = (params: TowerParams) => {
  const geometry = createBaseGeometry()
  const material = createMaterial()
  const mesh = new THREE.InstancedMesh(geometry, material, params.floors)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  applyTowerParams(mesh, params)
  return mesh
}

export const applyTowerParams = (mesh: THREE.InstancedMesh, params: TowerParams) => {
  const { floors, totalHeight, baseRadius, twistMin, twistMax, scaleMin, scaleMax, colorStart, colorEnd, gradientMode } =
    params

  const slabHeight = totalHeight / floors
  const startY = -totalHeight / 2 + slabHeight / 2
  const twistStart = THREE.MathUtils.degToRad(twistMin)
  const twistRange = THREE.MathUtils.degToRad(twistMax - twistMin)
  const colorScale = chroma.scale([colorStart, colorEnd])
  const easing = easingMap[gradientMode]

  for (let i = 0; i < floors; i += 1) {
    const linearT = floors === 1 ? 0 : i / (floors - 1)
    const easedT = easing(clamp01(linearT))
    const twist = twistStart + twistRange * linearT
    const radiusScale = THREE.MathUtils.lerp(scaleMin, scaleMax, easedT)
    const radius = Math.max(0.05, baseRadius * radiusScale)

    tempPosition.set(0, startY + i * slabHeight, 0)
    euler.set(0, twist, 0)
    tempQuaternion.setFromEuler(euler)
    tempScale.set(radius, slabHeight * 0.9, radius)
    tempMatrix.compose(tempPosition, tempQuaternion, tempScale)
    mesh.setMatrixAt(i, tempMatrix)

    const color = new THREE.Color(colorScale(linearT).hex())
    mesh.setColorAt(i, color)
  }

  mesh.count = floors
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true
  }
}
