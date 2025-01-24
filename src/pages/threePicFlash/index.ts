import * as THREE from 'three-platformize'
import { OrbitControls } from 'three-platformize/examples/jsm/controls/OrbitControls'
import { Power0, gsap } from 'gsap'
import { _concatVertexShader, computeCentroid, fragmentShader } from './bas'
import {
  $cancelAnimationFrame,
  $requestAnimationFrame,
  $window,
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  PLATFORM,
  Scene,
  sRGBEncoding,
  WebGL1Renderer,
} from 'three-platformize'

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
  createCameraControls?: boolean
  antialias?: boolean
  deviceInfo: Record<string, any>
}

export class THREERoot {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls?: OrbitControls
  deviceInfo: Record<string, any>

  constructor(params: THREERootParams) {
    params = utils.extend(
      {
        fov: 80,
        zNear: 10,
        zFar: 100000,
        createCameraControls: true,
      },
      params,
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
    this.camera.position.set(0, 0, 60)
    this.scene = new THREE.Scene()

    // 默认 false
    if (params.createCameraControls) {
      this.controls = new OrbitControls(this.camera, params.deviceInfo.canvas)
    }

    this.resize = this.resize.bind(this)
    this.tick = this.tick.bind(this)

    this.resize()
    this.tick()
    // window.addEventListener('resize', this.resize)
  }

  tick(): void {
    this.update()
    this.render()
    $requestAnimationFrame(this.tick)
  }

  update(): void {
    this.controls?.update()
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  resize(): void {
    this.camera.aspect = this.deviceInfo.windowWidth / this.deviceInfo.windowHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.deviceInfo.windowWidth, this.deviceInfo.windowHeight)
  }
}

const createAttribute = (geometry: THREE.BufferGeometry, name: string, itemSize: number) => {
  const buffer = new Float32Array(geometry.attributes.position.count * itemSize)
  const attribute = new THREE.BufferAttribute(buffer, itemSize)
  geometry.setAttribute(name, attribute)
  return attribute
}

// 转化为非索引模式
const handle = (bufferGeometry: THREE.BufferGeometry) => {
  // 用于存储重新组织后的顶点位置数据
  const newVerticesArray = []
  // 用于存储重新组织后的uv坐标数据
  const newUvArray = []
  // 用于存储重新组织后的法线数据
  const newNormalsArray = []

  const indexAttribute = bufferGeometry.index
  const indexArray = indexAttribute.array
  const prePositions = bufferGeometry.getAttribute('position').array
  const preUvs = bufferGeometry.getAttribute('uv').array
  const preNormals = bufferGeometry.getAttribute('normal').array

  let currentIndex = 0
  while (currentIndex < indexAttribute.count) {
    // 每个面由三个索引构成
    const index1 = indexArray[currentIndex]
    const index2 = indexArray[currentIndex + 1]
    const index3 = indexArray[currentIndex + 2]

    // 提取原始位置数据（每个顶点的 x, y, z）
    const vertex1 = [
      prePositions[index1 * 3],
      prePositions[index1 * 3 + 1],
      prePositions[index1 * 3 + 2],
    ]
    const vertex2 = [
      prePositions[index2 * 3],
      prePositions[index2 * 3 + 1],
      prePositions[index2 * 3 + 2],
    ]
    const vertex3 = [
      prePositions[index3 * 3],
      prePositions[index3 * 3 + 1],
      prePositions[index3 * 3 + 2],
    ]

    // 提取原始法线数据
    const normal1 = [preNormals[index1 * 3], preNormals[index1 * 3 + 1], preNormals[index1 * 3 + 2]]
    const normal2 = [preNormals[index2 * 3], preNormals[index2 * 3 + 1], preNormals[index2 * 3 + 2]]
    const normal3 = [preNormals[index3 * 3], preNormals[index3 * 3 + 1], preNormals[index3 * 3 + 2]]

    // 提取原始 UV 数据
    const uv1 = [preUvs[index1 * 2], preUvs[index1 * 2 + 1]]
    const uv2 = [preUvs[index2 * 2], preUvs[index2 * 2 + 1]]
    const uv3 = [preUvs[index3 * 2], preUvs[index3 * 2 + 1]]

    // 将每个顶点的位置、法线和 UV 数据添加到新数组中
    newVerticesArray.push(...vertex1, ...vertex2, ...vertex3)
    newNormalsArray.push(...normal1, ...normal2, ...normal3)
    newUvArray.push(...uv1, ...uv2, ...uv3)
    // 继续处理下一个面
    currentIndex += 3
  }

  bufferGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(newVerticesArray), 3),
  )
  bufferGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(newUvArray), 2))
  bufferGeometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(newNormalsArray), 3),
  )

  // 更新索引数组
  const indexAttrArray = Array.from({ length: 144000 }, (item, index) => index)

  // 将索引数组转换为 BufferAttribute, 一定是
  bufferGeometry.index = new THREE.BufferAttribute(new Uint32Array(indexAttrArray), 1)
}

const bufferPositions = (bufferGeometry: THREE.BufferGeometry) => {
  const positions = bufferGeometry.getAttribute('position').array
  const indices = bufferGeometry.index?.array || []

  const tempArr = []
  for (let i = 0; i < bufferGeometry.index.count / 3; i++) {
    // for (let i = 0; i < 3; i++) {
    const centroid: THREE.Vector3 = computeCentroid(indices, positions, i * 3)
    // 第 i 个面 3 个顶点
    const x1 = positions[i * 3 * 3]
    const y1 = positions[i * 3 * 3 + 1]
    const z1 = positions[i * 3 * 3 + 2]

    const x2 = positions[(i * 3 + 1) * 3]
    const y2 = positions[(i * 3 + 1) * 3 + 1]
    const z2 = positions[(i * 3 + 1) * 3 + 2]

    const x3 = positions[(i * 3 + 2) * 3]
    const y3 = positions[(i * 3 + 2) * 3 + 1]
    const z3 = positions[(i * 3 + 2) * 3 + 2]

    tempArr[i * 3 * 3] = x1 - centroid.x
    tempArr[i * 3 * 3 + 1] = y1 - centroid.y
    tempArr[i * 3 * 3 + 2] = z1 - centroid.z

    tempArr[(i * 3 + 1) * 3] = x2 - centroid.x
    tempArr[(i * 3 + 1) * 3 + 1] = y2 - centroid.y
    tempArr[(i * 3 + 1) * 3 + 2] = z2 - centroid.z

    tempArr[(i * 3 + 2) * 3] = x3 - centroid.x
    tempArr[(i * 3 + 2) * 3 + 1] = y3 - centroid.y
    tempArr[(i * 3 + 2) * 3 + 2] = z3 - centroid.z
  }
  bufferGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tempArr), 3))
}

export class Slide extends THREE.Mesh {
  totalDuration: number
  image: any

  constructor(width: number, height: number, animationPhase: 'in' | 'out') {
    const geometry = new THREE.PlaneGeometry(width, height, width * 2, height * 2)

    // separateFaces(geometry)

    handle(geometry)

    /**
     * 自定义的顶点属性。通过 createAttribute 方法创建属性并绑定到几何体上。每个属性的第二个参数是每个顶点需要存储的数据量（例如，3 表示三维向量）
     */
    // 存储动画相关的数据（延迟时间和持续时间）
    const aAnimation = createAttribute(geometry, 'aAnimation', 2)
    // 动画开始位置
    const aStartPosition = createAttribute(geometry, 'aStartPosition', 3)
    // 贝塞尔曲线的控制点
    const aControl0 = createAttribute(geometry, 'aControl0', 3)
    // 贝塞尔曲线的控制点
    const aControl1 = createAttribute(geometry, 'aControl1', 3)
    // 动画结束位置
    const aEndPosition = createAttribute(geometry, 'aEndPosition', 3)

    // 动画的最短持续时间
    const minDuration = 0.8
    // 动画的最长持续时间
    const maxDuration = 1.2
    // 计算动画的延迟时间
    const maxDelayX = 0.9
    // 计算动画的延迟时间
    const maxDelayY = 0.125
    // 调整延迟和持续时间的变化范围，影响动画的随机性
    const stretch = 0.11

    /**
     * 这四个 THREE.Vector3 对象分别用于存储每个面的位置以及贝塞尔曲线的控制点
     */
    const startPosition = new THREE.Vector3()
    const control0 = new THREE.Vector3()
    const control1 = new THREE.Vector3()
    const endPosition = new THREE.Vector3()
    // 临时的 Vector3 对象，计算控制点时存储结果
    const tempPoint = new THREE.Vector3()

    // 根据每个面的质心（centroid）计算并返回控制点生成贝塞尔曲线，初始弯曲
    const getControlPoint0 = (centroid: THREE.Vector3): THREE.Vector3 => {
      // Math.sign 共有 5 种返回值，分别是 1, -1, 0, -0, NaN. 代表的各是正数，负数，正零，负零，NaN
      const signY = Math.sign(centroid.y)
      // 0.1 到 0.3 这个范围取随机数 * 50
      tempPoint.x = THREE.MathUtils.randFloat(0.1, 0.3) * 50
      tempPoint.y = signY * THREE.MathUtils.randFloat(0.1, 0.3) * 70
      // 关于 0 对称的区间内的随机数，范围大小为 20
      tempPoint.z = THREE.MathUtils.randFloatSpread(20)
      return tempPoint
    }

    // 根据每个面的质心（centroid）计算并返回控制点生成贝塞尔曲线，最终弯曲
    const getControlPoint1 = (centroid: THREE.Vector3): THREE.Vector3 => {
      const signY = Math.sign(centroid.y)
      tempPoint.x = THREE.MathUtils.randFloat(0.3, 0.6) * 50
      tempPoint.y = -signY * THREE.MathUtils.randFloat(0.3, 0.6) * 70
      tempPoint.z = THREE.MathUtils.randFloatSpread(20)
      return tempPoint
    }

    // i：表示当前处理的三角形索引;
    // i2：用于访问 aAnimation 数组中当前三角形的起始位置（每个顶点有 2 个动画属性：延迟和时长，3 个顶点共 6 个值）
    // i3：用于访问位置相关属性（aStartPosition、aControl0 等）的起始位置（每个顶点有 3 个位置坐标，3 个顶点共 9 个值）
    for (let i = 0, i2 = 0, i3 = 0; i < geometry.index.count / 3; i++, i2 += 6, i3 += 9) {
      const positionAttribute = geometry.getAttribute('position')
      const positions = positionAttribute.array
      const indices = geometry.index?.array || []

      const centroid: THREE.Vector3 = computeCentroid(indices, positions, i * 3)

      // Animation
      // 根据质心的 X 和 Y 坐标计算动画的延迟时间（0.8到 1.2之间的随机数）
      const duration = THREE.MathUtils.randFloat(minDuration, maxDuration)
      // x：要映射的输入值; a1 和 a2：输入值 x 的原始范围的下限和上限; b1 和 b2：输出值的期望范围的下限和上限
      const delayX = THREE.MathUtils.mapLinear(
        centroid.x,
        -width * 0.5,
        width * 0.5,
        0.0,
        maxDelayX,
      )
      let delayY: number
      if (animationPhase === 'in') {
        delayY = THREE.MathUtils.mapLinear(Math.abs(centroid.y), 0, height * 1.5, 0.0, maxDelayY)
      } else {
        delayY = THREE.MathUtils.mapLinear(Math.abs(centroid.y), 0, height * 0.5, maxDelayY, 0.0)
      }
      const aAnimationArray = aAnimation.array as Float32Array
      // 每个顶点的延迟时间和持续时间被存储，格式为 [delay, duration]
      for (let v = 0; v < 6; v += 2) {
        aAnimationArray[i2 + v] = delayX + delayY + Math.random() * stretch * duration
        aAnimationArray[i2 + v + 1] = duration
      }
      // Positions
      // 初始化为面的质心
      endPosition.copy(centroid)
      startPosition.copy(centroid)
      if (animationPhase === 'in') {
        control0.copy(centroid).sub(getControlPoint0(centroid))
        control1.copy(centroid).sub(getControlPoint1(centroid))
      } else {
        // out
        control0.copy(centroid).add(getControlPoint0(centroid))
        control1.copy(centroid).add(getControlPoint1(centroid))
      }
      const aStartPositionArray = aStartPosition.array as Float32Array
      const aControl0Array = aControl0.array as Float32Array
      const aControl1Array = aControl1.array as Float32Array
      const aEndPositionArray = aEndPosition.array as Float32Array
      for (let v = 0; v < 9; v += 3) {
        aStartPositionArray[i3 + v] = startPosition.x
        aStartPositionArray[i3 + v + 1] = startPosition.y
        aStartPositionArray[i3 + v + 2] = startPosition.z
        aControl0Array[i3 + v] = control0.x
        aControl0Array[i3 + v + 1] = control0.y
        aControl0Array[i3 + v + 2] = control0.z
        aControl1Array[i3 + v] = control1.x
        aControl1Array[i3 + v + 1] = control1.y
        aControl1Array[i3 + v + 2] = control1.z
        aEndPositionArray[i3 + v] = endPosition.x
        aEndPositionArray[i3 + v + 1] = endPosition.y
        aEndPositionArray[i3 + v + 2] = endPosition.z
      }
    }

    const basicShader = THREE.ShaderLib['basic']
    const tempUniforms = THREE.UniformsUtils.merge([basicShader.uniforms, { uTime: { value: 0 } }])

    tempUniforms.map.value = new THREE.Texture()

    const material = new THREE.ShaderMaterial({
      vertexShader: _concatVertexShader(animationPhase),
      // 加了
      fragmentShader: fragmentShader,
      lights: false,
      uniforms: tempUniforms,
      defines: {
        USE_MAP: '',
        USE_UV: '',
      },
      side: THREE.DoubleSide,
    })

    bufferPositions(geometry)

    super(geometry, material)
    this.frustumCulled = false
    // 每个面动画的总持续时间
    this.totalDuration = maxDuration + maxDelayX + maxDelayY + stretch
  }

  setImage(image: HTMLImageElement | HTMLCanvasElement | THREE.Texture): void {
    ;(this.material as THREE.ShaderMaterial).uniforms.map.value.image = image
    ;(this.material as THREE.ShaderMaterial).uniforms.map.value.needsUpdate = true
  }

  get time(): number {
    return (this.material as THREE.ShaderMaterial).uniforms['uTime'].value
  }

  // 设置时间属性
  set time(v: number) {
    ;(this.material as THREE.ShaderMaterial).uniforms['uTime'].value = v
  }

  transition() {
    return gsap
      .fromTo(
        this,
        { time: 0.0 },
        {
          time: this.totalDuration,
          ease: Power0.easeInOut,
        },
      )
      .duration(3.0)
  }
}

export const show = (deviceInfo: Record<string, any>, canvas: HTMLCanvasElement) => {
  const root = new THREERoot({
    createCameraControls: !true,
    antialias: deviceInfo.pixelRatio === 1,
    fov: 80,
    deviceInfo: deviceInfo,
  })

  const width = 40,
    height = 90

  // 无限重复，重复之前会延迟1秒，来回反复
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, yoyo: true })
  const twoPic = (animationPhase: 'in' | 'out', url: string) => {
    const slide = new Slide(width, height, animationPhase)

    const l = new THREE.ImageLoader()
    l.load(
      url,
      (image) => {
        console.log('image')
        console.log(image)
        slide.setImage(image)
      },
      undefined,
      (e) => {
        console.error('error: ', e)
      },
    )
    root.scene.add(slide)
    // tl.add(slide.transition(), 0)
  }
  twoPic('in', '../../static/images/logo1.jpg')
  twoPic('out', '../../static/images/logo.jpg')
}
