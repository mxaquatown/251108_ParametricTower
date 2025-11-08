import * as THREE from 'three'
import chroma from 'chroma-js'
import type { GradientMode, TowerParams } from '../state/useTowerControls'

const easingMap: Record<GradientMode, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const baseGeometries = new Map<number, THREE.CylinderGeometry>()

const getBaseGeometry = (sides: number) => {
  const clamped = Math.max(3, Math.min(128, Math.round(sides)))
  if (baseGeometries.has(clamped)) {
    return baseGeometries.get(clamped)!.clone()
  }

  const geometry = new THREE.CylinderGeometry(1, 1, 1, clamped, 1, false, 0, Math.PI * 2)
  if (clamped === 4) {
    geometry.rotateY(Math.PI / 4)
  } else if (clamped === 3) {
    geometry.rotateY(Math.PI / 6)
  }
  geometry.computeVertexNormals()
  baseGeometries.set(clamped, geometry.clone())
  return geometry.clone()
}

const buildTowerGeometry = (params: TowerParams) => {
  const baseGeometry = getBaseGeometry(params.floorSides)
  const basePositions = baseGeometry.attributes.position
  const baseNormals = baseGeometry.attributes.normal
  const baseIndices = baseGeometry.index

  const vertsPerSlab = basePositions.count
  const indicesPerSlab = baseIndices ? baseIndices.count : 0

  const totalVertices = vertsPerSlab * params.floors
  const totalIndices = indicesPerSlab * params.floors

  const positions = new Float32Array(totalVertices * 3)
  const normals = new Float32Array(totalVertices * 3)
  const colors = new Float32Array(totalVertices * 3)
  const indices = new Uint32Array(totalIndices)

  const twistStart = THREE.MathUtils.degToRad(params.twistMin)
  const twistRange = THREE.MathUtils.degToRad(params.twistMax - params.twistMin)
  const twistEase = easingMap[params.twistGradient]
  const scaleEase = easingMap[params.scaleGradient]
  const colorScale = chroma.scale([params.colorStart, params.colorEnd])

  const thickness = Math.max(0.05, params.slabThickness)
  const spacing = params.floors <= 1 ? 0 : params.totalHeight / (params.floors - 1)
  const startY = params.floors <= 1 ? 0 : -params.totalHeight / 2

  const position = new THREE.Vector3()
  const normal = new THREE.Vector3()
  const matrix = new THREE.Matrix4()
  const normalMatrix = new THREE.Matrix3()
  const quaternion = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const euler = new THREE.Euler()

  for (let floor = 0; floor < params.floors; floor += 1) {
    const linearT = params.floors === 1 ? 0 : floor / (params.floors - 1)
    const twist = twistStart + twistRange * twistEase(clamp01(linearT))
    const radiusScale = THREE.MathUtils.lerp(params.scaleMin, params.scaleMax, scaleEase(clamp01(linearT)))
    const radius = Math.max(0.05, params.baseRadius * radiusScale)
    const y = params.floors === 1 ? 0 : startY + floor * spacing

    position.set(0, y, 0)
    euler.set(0, twist, 0)
    quaternion.setFromEuler(euler)
    scale.set(radius, thickness, radius)
    matrix.compose(position, quaternion, scale)
    normalMatrix.getNormalMatrix(matrix)

    const color = new THREE.Color(chroma(colorScale(linearT)).brighten(0.3).hex())

    for (let i = 0; i < vertsPerSlab; i += 1) {
      const vertexIndex = floor * vertsPerSlab + i

      position.fromBufferAttribute(basePositions, i)
      position.applyMatrix4(matrix)
      positions.set([position.x, position.y, position.z], vertexIndex * 3)

      normal.fromBufferAttribute(baseNormals, i)
      normal.applyMatrix3(normalMatrix).normalize()
      normals.set([normal.x, normal.y, normal.z], vertexIndex * 3)

      colors.set([color.r, color.g, color.b], vertexIndex * 3)
    }

    if (baseIndices) {
      for (let i = 0; i < baseIndices.count; i += 1) {
        indices[floor * baseIndices.count + i] = baseIndices.getX(i) + floor * vertsPerSlab
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  if (indicesPerSlab > 0) {
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  }
  geometry.computeBoundingSphere()
  geometry.computeBoundingBox()
  return geometry
}

const createMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.42,
    metalness: 0.08,
  })

export const createTowerMesh = (params: TowerParams) => {
  const geometry = buildTowerGeometry(params)
  const material = createMaterial()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export const updateTowerGeometry = (mesh: THREE.Mesh, params: TowerParams) => {
  const nextGeometry = buildTowerGeometry(params)
  mesh.geometry.dispose()
  mesh.geometry = nextGeometry
}
