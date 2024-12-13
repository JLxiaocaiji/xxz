import * as THREE from 'three-platformize'
import { OrbitControls } from 'three-platformize/examples/jsm/controls/OrbitControls'
import { $cancelAnimationFrame, $requestAnimationFrame } from 'three-platformize'

const utils = {
  // 源对象src中的所有属性复制到目标对象dst
  extend: function <T extends Record<string, any>, U extends Record<string, any>>(
    dst: T,
    src: U,
  ): T & U {
    for (const key in src) {
      // 安全地检查 src 对象是否拥有指定的属性
      if (Object.prototype.hasOwnProperty.call(src, key)) {
        dst[key as keyof T] = src[key] as unknown as T[keyof T]
      }
    }
    return dst as T & U
  },
}

interface THREERootParams {
  fov?: number
  zNear?: number
  zFar?: number
  antialias?: boolean
  deviceInfo: Record<string, any>
  cameraPos?: THREE.Vector3
  canvas: HTMLCanvasElement
}

export class THREERoot {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls?: OrbitControls
  deviceInfo: Record<string, any>
  disposing: Boolean
  frameId: any
  time?: number
  spriteMaterial?: THREE.SpriteMaterial

  constructor(inComingParam: THREERootParams) {
    const params = utils.extend(
      {
        fov: 80,
        zNear: 0.1,
        zFar: 1000,
        cameraPos: new THREE.Vector3().fromArray([0, 0, 100]),
      },
      inComingParam,
    )

    this.deviceInfo = params.deviceInfo

    this.renderer = new THREE.WebGLRenderer({
      antialias: params.antialias,
      alpha: true,
    })

    this.renderer.setClearColor(0x000000, 0)

    this.renderer.setPixelRatio(Math.min(2, params.deviceInfo.pixelRatio || 1))

    this.camera = new THREE.PerspectiveCamera(
      params.fov,
      params.deviceInfo.windowWidth / params.deviceInfo.windowHeight,
      params.zNear,
      params.zFar,
    )
    this.camera.position.set(params.cameraPos.x, params.cameraPos.y, params.cameraPos.z)
    this.scene = new THREE.Scene()

    // 默认 false, this.controls?.update() 与 相机发生冲突
    this.controls = new OrbitControls(this.camera, params.canvas)
    // this.controls.enableDamping = true // 启用阻尼，平滑过渡
    this.controls.dampingFactor = 0.25 // 设置阻尼因子
    this.controls.minPolarAngle = Math.PI / 2
    this.controls.maxPolarAngle = Math.PI / 2

    this.disposing = false
    this.resize = this.resize.bind(this)
    this.tick = this.tick.bind(this)

    this.resize()
    this.tick()
  }

  tick(): void {
    this.update()
    this.render()


    if (this.time && this.spriteMaterial) {
          console.log("this.time")
      this.time += 0.05
      this.spriteMaterial.opacity = Math.abs(Math.sin(this.time)) * 0.5 + 0.5
    }

    if (!this.disposing) {
      this.frameId = $requestAnimationFrame(this.tick)
    }
  }

  update(): void {
    // this.controls?.update()
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  resize(): void {
    this.camera.aspect = this.deviceInfo.windowWidth / this.deviceInfo.windowHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.deviceInfo.windowWidth, this.deviceInfo.windowHeight)
  }

  dispose(): void {
    this.disposing = true
    $cancelAnimationFrame(this.frameId)
  }

  getInstance() {
    return this
  }

  // sprite
  createSprite(spriteImg: string, time: number): void {
    const spriteTexture = new THREE.TextureLoader().load(spriteImg)
    this.spriteMaterial = new THREE.SpriteMaterial({
      map: spriteTexture,
      transparent: true,
      opacity: 1.0, // 初始透明度
      alphaTest: 0.5, // 可选，确保透明区域不渲染
    })
    const sprite = new THREE.Sprite(this.spriteMaterial)
    sprite.scale.set(16, 16, 1)
    sprite.position.set(20, 20, 0)

    this.time = time
    console.log('time')
    console.log(time)
    this.scene.add(sprite)
  }
}
