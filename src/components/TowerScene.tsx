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
    const towerHeight = params.slabThickness + Math.max(0, (params.floors - 1) * params.floorSpacing)
    controls.maxPolarAngle = Math.PI * 0.52
    controls.autoRotate = params.autoRotate
    controls.autoRotateSpeed = 0.45
    controls.target.set(0, towerHeight * 0.4, 0)
    controls.update()
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight('#cfd6e1', 0.4)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight('#f3f4f7', '#b5bcca', 0.5)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.4)
    keyLight.position.set(30, 50, 20)
    keyLight.castShadow = true
    keyLight.shadow.camera.left = -40
    keyLight.shadow.camera.right = 40
    keyLight.shadow.camera.top = 60
    keyLight.shadow.camera.bottom = -40
    keyLight.shadow.camera.near = 10
    keyLight.shadow.camera.far = 160
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight('#d1d9f7', 0.55)
    rimLight.position.set(-45, 45, -25)
    scene.add(rimLight)

    const fillLight = new THREE.PointLight('#f1f3ff', 0.4, 200)
    fillLight.position.set(-20, 20, 30)
    scene.add(fillLight)

    const baseGrid = new THREE.GridHelper(1200, 300, 0xdedede, 0xe6e6e6)
    baseGrid.material.depthWrite = false
    baseGrid.material.opacity = 0.35
    baseGrid.material.transparent = true
    scene.add(baseGrid)

    const gridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#dcdfe5') },
        uFadeDistance: { value: 600 },
        uSpacing: { value: 4 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        uniform vec3 uColor;
        uniform float uFadeDistance;
        float ripple(float value, float spacing) {
          return 1.0 - smoothstep(0.0, spacing, abs(mod(value, spacing) - spacing / 2.0));
        }
        void main() {
          float distance = length(vWorldPosition.xz);
          float fade = smoothstep(uFadeDistance, 0.0, distance);
          float line = ripple(vWorldPosition.x, uSpacing) + ripple(vWorldPosition.z, uSpacing);
          line = clamp(line, 0.0, 1.0);
          float alpha = line * fade * 0.35;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
    })

    const infiniteGrid = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 1, 1), gridMaterial)
    infiniteGrid.rotation.x = -Math.PI / 2
    infiniteGrid.position.y = 0
    scene.add(infiniteGrid)

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
      baseGrid.geometry.dispose()
      disposeMaterial(baseGrid.material)
      infiniteGrid.geometry.dispose()
      gridMaterial.dispose()
      keyLight.dispose()
      rimLight.dispose()
      hemiLight.dispose()
      ambientLight.dispose()
      fillLight.dispose()
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
      const towerHeight = params.slabThickness + Math.max(0, (params.floors - 1) * params.floorSpacing)
      controlsRef.current.autoRotate = params.autoRotate
      controlsRef.current.autoRotateSpeed = 0.45
      controlsRef.current.target.y = towerHeight * 0.4
      controlsRef.current.update()
    }
  }, [params, sceneReady])

  return <div className="tower-scene" ref={containerRef} />
}
