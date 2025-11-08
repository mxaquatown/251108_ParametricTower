import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useTowerControls, selectParams } from '../state/useTowerControls'
import { createTowerMesh, updateTowerGeometry } from '../lib/towerBuilder'

const disposeMesh = (mesh: THREE.Mesh) => {
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
  const towerRef = useRef<THREE.Mesh | null>(null)
  const animationRef = useRef<number | null>(null)
  const params = useTowerControls(selectParams)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a1124')
    scene.fog = new THREE.Fog('#0a1124', 80, 260)
    sceneRef.current = scene

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
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
    controls.autoRotate = params.autoRotate
    controls.autoRotateSpeed = 0.45
    controls.target.set(0, params.totalHeight * 0.25, 0)
    controls.update()
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight('#8aa0d8', 0.35)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight('#a8c7ff', '#080808', 0.65)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.55)
    keyLight.position.set(32, 70, 18)
    keyLight.castShadow = true
    keyLight.shadow.camera.left = -40
    keyLight.shadow.camera.right = 40
    keyLight.shadow.camera.top = 60
    keyLight.shadow.camera.bottom = -40
    keyLight.shadow.camera.near = 10
    keyLight.shadow.camera.far = 160
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight('#6ec7ff', 0.6)
    rimLight.position.set(-48, 55, -30)
    scene.add(rimLight)

    const fillLight = new THREE.PointLight('#86a5ff', 0.6, 220)
    fillLight.position.set(-26, 30, 24)
    scene.add(fillLight)

    const warmBounce = new THREE.PointLight('#ffb38a', 0.45, 200)
    warmBounce.position.set(18, 15, -28)
    scene.add(warmBounce)

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(140, 72),
      new THREE.MeshStandardMaterial({ color: '#0c1224', roughness: 0.92, metalness: 0.05 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const grid = new THREE.GridHelper(160, 80, 0x22355b, 0x111b33)
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
      ambientLight.dispose()
      fillLight.dispose()
      warmBounce.dispose()
    }
  }, [])

  useEffect(() => {
    if (!sceneReady || !sceneRef.current) {
      return
    }

    const scene = sceneRef.current

    if (!towerRef.current) {
      const mesh = createTowerMesh(params)
      scene.add(mesh)
      towerRef.current = mesh
      return
    }

    updateTowerGeometry(towerRef.current, params)

    if (controlsRef.current) {
      controlsRef.current.autoRotate = params.autoRotate
      controlsRef.current.autoRotateSpeed = 0.45
      controlsRef.current.target.y = params.totalHeight * 0.25
      controlsRef.current.update()
    }
  }, [params, sceneReady])

  return <div className="tower-scene" ref={containerRef} />
}
