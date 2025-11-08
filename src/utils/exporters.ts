import type { TowerParams } from '../state/useTowerControls'
import { buildTowerGeometry } from '../lib/towerBuilder'

const formatNumber = (value: number) => Number.parseFloat(value.toFixed(6))

export const exportTowerToOBJ = (params: TowerParams) => {
  const geometry = buildTowerGeometry(params)
  geometry.computeVertexNormals()

  const positions = geometry.getAttribute('position')
  const normals = geometry.getAttribute('normal')
  const colors = geometry.getAttribute('color')
  const indices = geometry.getIndex()

  const lines: string[] = [
    '# Parametric Tower OBJ Export',
    '# Axis swapped: Y -> Z to keep tower upright',
    '# Columns: v x y z r g b',
  ]

  const swapAxis = (x: number, y: number, z: number) => ({ x, y: z, z: -y })

  for (let i = 0; i < positions.count; i += 1) {
    const original = { x: positions.getX(i), y: positions.getY(i), z: positions.getZ(i) }
    const { x, y, z } = swapAxis(original.x, original.y, original.z)
    const r = colors ? colors.getX(i) : 1
    const g = colors ? colors.getY(i) : 1
    const b = colors ? colors.getZ(i) : 1
    lines.push(`v ${formatNumber(x)} ${formatNumber(y)} ${formatNumber(z)} ${formatNumber(r)} ${formatNumber(g)} ${formatNumber(b)}`)
  }

  if (normals) {
    for (let i = 0; i < normals.count; i += 1) {
      const original = { x: normals.getX(i), y: normals.getY(i), z: normals.getZ(i) }
      const { x, y, z } = swapAxis(original.x, original.y, original.z)
      lines.push(`vn ${formatNumber(x)} ${formatNumber(y)} ${formatNumber(z)}`)
    }
  }

  if (indices) {
    for (let i = 0; i < indices.count; i += 3) {
      const a = indices.getX(i) + 1
      const b = indices.getX(i + 1) + 1
      const c = indices.getX(i + 2) + 1
      if (normals) {
        lines.push(`f ${a}//${a} ${b}//${b} ${c}//${c}`)
      } else {
        lines.push(`f ${a} ${b} ${c}`)
      }
    }
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'parametric-tower.obj'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  geometry.dispose()
}
