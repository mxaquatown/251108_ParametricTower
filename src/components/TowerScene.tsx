import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTowerControls, selectParams } from '../state/useTowerControls'
import { applyTowerParams, createTowerMesh } from '../lib/towerBuilder'

const disposeMesh = (mesh: THREE.InstancedMesh) => {
  mesh.geometry.dispose()
  const { material } = mesh
  if (Array.isArray(material)) {
    material.forEach((mat) => mat.dispose())
  } else {
    material.dispose()
  }
}

const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach((mat) => mat.dispose())
  } else {
    material.dispose()
  }
}

const fadeGridMaterial = (material: THREE.Material | THREE.Material[], opacity: number) => {
  const applyOpacity = (mat: THREE.Material) => {
    const target = mat as THREE.Material & { opacity?: number; transparent?: boolean }
    if (typeof target.opacity === 'number') {
      target.opacity = opacity
      target.transparent = true
    }
  }

  if (Array.isArray(material)) {
    material.forEach(applyOpacity)
  } else {
    applyOpacity(material)
  }
}

export const TowerScene = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const towerRef = useRef<THREE.InstancedMesh | null>(null)
  const animationRef = useRef<number | null>(null)
  const params = useTowerControls(selectParams)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#040712')
    scene.fog = new THREE.Fog('#040712', 60, 220)
    sceneRef.current = scene

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 500)
    camera.position.set(24, 28, 28)
    cameraRef.current = camera

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.maxPolarAngle = Math.PI * 0.52
    controls.target.set(0, params.totalHeight * 0.25, 0)
    controls.update()
    controlsRef.current = controls

    const hemiLight = new THREE.HemisphereLight('#a8c7ff', '#080808', 0.55)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.35)
    keyLight.position.set(30, 60, 10)
    keyLight.castShadow = true
    keyLight.shadow.camera.left = -40
    keyLight.shadow.camera.right = 40
    keyLight.shadow.camera.top = 60
    keyLight.shadow.camera.bottom = -40
    keyLight.shadow.camera.near = 10
    keyLight.shadow.camera.far = 160
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight('#6ec7ff', 0.45)
    rimLight.position.set(-40, 50, -30)
    scene.add(rimLight)

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(140, 72),
      new THREE.MeshStandardMaterial({ color: '#080b16', roughness: 0.95, metalness: 0 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const grid = new THREE.GridHelper(160, 80, 0x1a243b, 0x0f1627)
    grid.position.y = 0.01
    scene.add(grid)
    fadeGridMaterial(grid.material, 0.35)

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return
      const { clientWidth, clientHeight } = containerRef.current
      rendererRef.current.setSize(clientWidth, clientHeight)
      cameraRef.current.aspect = clientWidth / clientHeight
      cameraRef.current.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)
    setSceneReady(true)

    return () => {
      setSceneReady(false)
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      controls.dispose()
      container.removeChild(renderer.domElement)
      renderer.dispose()
      if (towerRef.current) {
        disposeMesh(towerRef.current)
        towerRef.current = null
      }
      grid.geometry.dispose()
      disposeMaterial(grid.material)
      ground.geometry.dispose()
      ;(ground.material as THREE.Material).dispose()
      keyLight.dispose()
      rimLight.dispose()
      hemiLight.dispose()
    }
  }, [])

  useEffect(() => {
    if (!sceneReady || !sceneRef.current) {
      return
    }

    const scene = sceneRef.current
    const needsNewMesh =
      !towerRef.current ||
      typeof towerRef.current.userData.capacity !== 'number' ||
      params.floors > towerRef.current.userData.capacity

    if (needsNewMesh) {
      if (towerRef.current) {
        scene.remove(towerRef.current)
        disposeMesh(towerRef.current)
        towerRef.current = null
      }
      const mesh = createTowerMesh(params)
      mesh.userData.capacity = params.floors
      scene.add(mesh)
      towerRef.current = mesh
      return
    }

    if (towerRef.current) {
      applyTowerParams(towerRef.current, params)
    }

    if (controlsRef.current) {
      controlsRef.current.target.y = params.totalHeight * 0.25
      controlsRef.current.update()
    }
  }, [params, sceneReady])

  return <div className="tower-scene" ref={containerRef} />
}
