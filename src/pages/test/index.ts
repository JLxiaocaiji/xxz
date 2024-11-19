import * as THREE from 'three-platformize'
import { OrbitControls } from 'three-platformize/examples/jsm/controls/OrbitControls'
import { TweenMax, TweenLite, Tween, Power0, TimelineMax, GSAPTween, gsap } from 'gsap'
import BAS from './bas'

// export const init = () => {
export const show = (deviceInfo: Record<string, any>) => {
  const root = new THREERoot({
    createCameraControls: !true,
    antialias: deviceInfo.devicePixelRatio === 1,
    fov: 80,
    deviceInfo: deviceInfo,
  })

  root.renderer.setClearColor(0x000000, 0)
  root.renderer.setPixelRatio(deviceInfo.devicePixelRatio || 1)
  root.camera.position.set(0, 0, 60)

  const width = 100
  const height = 60

  const slide = new Slide(width, height, 'out')
  const l1 = new THREE.ImageLoader()
  l1.setCrossOrigin('Anonymous')
  l1.load('./winter.jpg', function (img) {
    slide.setImage(img)
  })
  root.scene.add(slide)

  const slide2 = new Slide(width, height, 'in')
  const l2 = new THREE.ImageLoader()
  l2.setCrossOrigin('Anonymous')
  l2.load('./spring.png', function (img) {
    slide2.setImage(img)
  })

  root.scene.add(slide2)

  const tl = new TimelineMax({ repeat: -1, repeatDelay: 1.0, yoyo: true })

  tl.add(slide.transition(), 0)
  tl.add(slide2.transition(), 0)

  createTweenScrubber(tl)

  // window.addEventListener('keyup', function (e) {
  //   if (e.keyCode === 80) {
  //     tl.paused(!tl.paused())
  //   }
  // })
}

////////////////////
// CLASSES
////////////////////

class Slide extends THREE.Mesh {
  totalDuration: number

  constructor(width: number, height: number, animationPhase: 'in' | 'out') {
    const plane = new THREE.PlaneGeometry(width, height, width * 2, height * 2)
    const geometry = new SlideGeometry(plane)

    console.log(44444)
    const material = new BAS.BasicAnimationMaterial(
      {
        flatShading: THREE.FlatShading,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { type: 'f', value: 0 },
        },
        shaderFunctions: [
          BAS.ShaderChunk['cubic_bezier'],
          BAS.ShaderChunk['ease_in_out_cubic'],
          BAS.ShaderChunk['quaternion_rotation'],
        ],
        shaderParameters: [
          'uniform float uTime;',
          'attribute vec2 aAnimation;',
          'attribute vec3 aStartPosition;',
          'attribute vec3 aControl0;',
          'attribute vec3 aControl1;',
          'attribute vec3 aEndPosition;',
        ],
        shaderVertexInit: [
          'float tDelay = aAnimation.x;',
          'float tDuration = aAnimation.y;',
          'float tTime = clamp(uTime - tDelay, 0.0, tDuration);',
          'float tProgress = ease(tTime, 0.0, 1.0, tDuration);',
        ],
        shaderTransformPosition: [
          animationPhase === 'in' ? 'transformed *= tProgress;' : 'transformed *= 1.0 - tProgress;',
          'transformed += cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);',
        ],
      },
      {
        map: new THREE.Texture(),
      },
    )

    console.log(55555)
    console.log(material)

    // Assume BAS.Utils.separateFaces exists as it was used in original code
    BAS.Utils.separateFaces(plane)
    geometry.bufferUVs()

    const aAnimation = geometry.createAttribute('aAnimation', 2)
    const aStartPosition = geometry.createAttribute('aStartPosition', 3)
    const aControl0 = geometry.createAttribute('aControl0', 3)
    const aControl1 = geometry.createAttribute('aControl1', 3)
    const aEndPosition = geometry.createAttribute('aEndPosition', 3)

    let i: number, i2: number, i3: number, i4: number, v: number

    const minDuration = 0.8
    const maxDuration = 1.2
    const maxDelayX = 0.9
    const maxDelayY = 0.125
    const stretch = 0.11

    const startPosition = new THREE.Vector3()
    const control0 = new THREE.Vector3()
    const control1 = new THREE.Vector3()
    const endPosition = new THREE.Vector3()

    const tempPoint = new THREE.Vector3()

    const getControlPoint0 = (centroid: THREE.Vector3): THREE.Vector3 => {
      const signY = Math.sign(centroid.y)
      tempPoint.x = THREE.MathUtils.randFloat(0.1, 0.3) * 50
      tempPoint.y = signY * THREE.MathUtils.randFloat(0.1, 0.3) * 70
      tempPoint.z = THREE.MathUtils.randFloatSpread(20)
      return tempPoint
    }

    const getControlPoint1 = (centroid: THREE.Vector3): THREE.Vector3 => {
      const signY = Math.sign(centroid.y)
      tempPoint.x = THREE.MathUtils.randFloat(0.3, 0.6) * 50
      tempPoint.y = -signY * THREE.MathUtils.randFloat(0.3, 0.6) * 70
      tempPoint.z = THREE.MathUtils.randFloatSpread(20)
      return tempPoint
    }

    for (i = 0, i2 = 0, i3 = 0, i4 = 0; i < geometry.index.count; i++, i2 += 6, i3 += 9, i4 += 12) {
      const face = plane.faces[i]
      const centroid = BAS.Utils.computeCentroid(plane, face)

      // Animation
      const duration = THREE.MathUtils.randFloat(minDuration, maxDuration)
      const delayX = THREE.MathUtils.mapLinear(
        centroid.x,
        -width * 0.5,
        width * 0.5,
        0.0,
        maxDelayX,
      )
      let delayY: number

      if (animationPhase === 'in') {
        delayY = THREE.MathUtils.mapLinear(Math.abs(centroid.y), 0, height * 0.5, 0.0, maxDelayY)
      } else {
        delayY = THREE.MathUtils.mapLinear(Math.abs(centroid.y), 0, height * 0.5, maxDelayY, 0.0)
      }

      const aAnimationArray = aAnimation.array as Float32Array

      for (v = 0; v < 6; v += 2) {
        aAnimationArray[i2 + v] = delayX + delayY + Math.random() * stretch * duration
        aAnimationArray[i2 + v + 1] = duration
      }

      // Positions
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

      for (v = 0; v < 9; v += 3) {
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
    super(geometry, material)
    this.totalDuration = maxDuration + maxDelayX + maxDelayY + stretch
    this.frustumCulled = false
  }

  get time(): number {
    return (this.material as THREE.ShaderMaterial).uniforms['uTime'].value
  }

  set time(v: number) {
    ;(this.material as THREE.ShaderMaterial).uniforms['uTime'].value = v
  }

  setImage(image: HTMLImageElement): void {
    ;(this.material as THREE.ShaderMaterial).uniforms.map.value.image = image
    ;(this.material as THREE.ShaderMaterial).uniforms.map.value.needsUpdate = true
  }

  transition(): GSAPTween {
    return gsap.fromTo(
      this,
      3.0,
      { time: 0.0 },
      { time: this.totalDuration, ease: Power0.easeInOut },
    )
  }
}

class SlideGeometry extends BAS.ModelBufferGeometry {
  modelGeometry: THREE.BufferGeometry
  faceCount: number
  vertexCount: number

  constructor(model: THREE.BufferGeometry) {
    super(model)

    this.modelGeometry = model
    this.faceCount = this.modelGeometry.index ? this.modelGeometry.index.count / 3 : 0
    this.vertexCount = this.modelGeometry.attributes.position.count
    // this.bufferPositions()
  }

  // 填充顶点位置数据
  bufferPositions(): void {
    // 使用类型断言，假定 'position' 属性的数组是 Float32Array 类型
    const positionBuffer = this.createAttribute('position', 3).array as Float32Array

    // 获取位置属性
    const positionAttribute = this.modelGeometry.attributes.position as THREE.BufferAttribute

    // 遍历每个面，计算每个顶点相对于重心的位置
    for (let i = 0; i < this.faceCount; i++) {
      const idx = i * 3 // 每个面有3个顶点
      const a = idx // 顶点A索引
      const b = idx + 1 // 顶点B索引
      const c = idx + 2 // 顶点C索引

      // 获取每个顶点的位置
      const vertexA = new THREE.Vector3(
        positionAttribute.getX(a),
        positionAttribute.getY(a),
        positionAttribute.getZ(a),
      )
      const vertexB = new THREE.Vector3(
        positionAttribute.getX(b),
        positionAttribute.getY(b),
        positionAttribute.getZ(b),
      )
      const vertexC = new THREE.Vector3(
        positionAttribute.getX(c),
        positionAttribute.getY(c),
        positionAttribute.getZ(c),
      )

      // 计算重心
      const centroid = new THREE.Vector3()
      centroid.add(vertexA).add(vertexB).add(vertexC).divideScalar(3)

      // 将顶点相对于重心进行偏移
      positionBuffer[a * 3] = vertexA.x - centroid.x
      positionBuffer[a * 3 + 1] = vertexA.y - centroid.y
      positionBuffer[a * 3 + 2] = vertexA.z - centroid.z

      positionBuffer[b * 3] = vertexB.x - centroid.x
      positionBuffer[b * 3 + 1] = vertexB.y - centroid.y
      positionBuffer[b * 3 + 2] = vertexB.z - centroid.z

      positionBuffer[c * 3] = vertexC.x - centroid.x
      positionBuffer[c * 3 + 1] = vertexC.y - centroid.y
      positionBuffer[c * 3 + 2] = vertexC.z - centroid.z
    }
  }
}

interface THREERootParams {
  fov?: number
  zNear?: number
  zFar?: number
  createCameraControls?: boolean
  antialias?: boolean
  deviceInfo: Record<string, any>
}

class THREERoot {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls?: OrbitControls
  deviceInfo: Record<string, any>

  constructor(params: THREERootParams) {
    params = utils.extend(
      {
        fov: 60,
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

    this.renderer.setPixelRatio(Math.min(2, params.deviceInfo.devicePixelRatio || 1))

    // .appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      params.fov,
      params.deviceInfo.windowWidth / params.deviceInfo.windowHeight,
      params.zNear,
      params.zFar,
    )

    this.scene = new THREE.Scene()

    // 默认 false
    if (params.createCameraControls) {
      this.controls = new OrbitControls(this.camera, params.deviceInfo.canvas)
    }

    this.resize = this.resize.bind(this)
    this.tick = this.tick.bind(this)

    this.resize()
    this.tick()
    // window.addEventListener('resize', this.resize, false)
  }

  tick(): void {
    this.update()
    this.render()
    THREE.$requestAnimationFrame(this.tick)
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

////////////////////
// UTILS
////////////////////

// 定义一个类型用于表示三维向量
// 定义一个类型用于表示三维向量
interface Vector3 {
  x: number
  y: number
  z: number
}

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

  // 返回一个随机的符号，1或-1
  randSign: function (): number {
    return Math.random() > 0.5 ? 1 : -1
  },

  // 动画缓动函数
  /**
   * 使用给定的缓动函数ease来计算当前时间t下的位置
   * @param ease 缓动函数
   * @param t 当前时间
   * @param b 初始位置
   * @param c 变化量
   * @param d 总时间
   * @returns 计算后的当前位置
   */
  ease: function (
    ease: { getRatio: (t: number) => number },
    t: number,
    b: number,
    c: number,
    d: number,
  ): number {
    return b + ease.getRatio(t / d) * c
  },

  // 返回一个函数，该函数根据斐波那契球面分割算法生成一个三维空间中的点
  fibSpherePoint: (function () {
    const vec: Vector3 = { x: 0, y: 0, z: 0 }
    const G = Math.PI * (3 - Math.sqrt(5))

    return function (i: number, n: number, radius: number = 1): Vector3 {
      const step = 2.0 / n

      vec.y = i * step - 1 + step * 0.5
      const r = Math.sqrt(1 - vec.y * vec.y)
      const phi = i * G
      vec.x = Math.cos(phi) * r
      vec.z = Math.sin(phi) * r

      vec.x *= radius
      vec.y *= radius
      vec.z *= radius

      return vec
    }
  })(),

  // 返回一个函数，该函数生成一个单位球面上的随机点
  spherePoint: (function () {
    return function (u: number = Math.random(), v: number = Math.random()): Vector3 {
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)

      const vec: Vector3 = {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      }

      return vec
    }
  })(),
}

const createTweenScrubber = (tween: Tween, seekSpeed: number = 0.001) => {
  function stop(): void {
    TweenMax.to(tween, 1, { timeScale: 0 })
  }

  function resume(): void {
    TweenMax.to(tween, 1, { timeScale: 1 })
  }

  function seek(dx: number): void {
    const progress = tween.progress()
    const p = THREE.MathUtils.clamp(progress + dx * seekSpeed, 0, 1)

    tween.progress(p)
  }

  let _cx = 0

  // desktop
  let mouseDown = false
  document.body.style.cursor = 'pointer'

  window.addEventListener('mousedown', function (e) {
    mouseDown = true
    document.body.style.cursor = 'ew-resize'
    _cx = e.clientX
    stop()
  })
  window.addEventListener('mouseup', function (e) {
    mouseDown = false
    document.body.style.cursor = 'pointer'
    resume()
  })
  window.addEventListener('mousemove', function (e) {
    if (mouseDown === true) {
      const cx = e.clientX
      const dx = cx - _cx
      _cx = cx

      seek(dx)
    }
  })
  // mobile
  window.addEventListener('touchstart', function (e) {
    _cx = e.touches[0].clientX
    stop()
    e.preventDefault()
  })
  window.addEventListener('touchend', function (e) {
    resume()
    e.preventDefault()
  })
  window.addEventListener('touchmove', function (e) {
    const cx = e.touches[0].clientX
    const dx = cx - _cx
    _cx = cx

    seek(dx)
    e.preventDefault()
  })
}
