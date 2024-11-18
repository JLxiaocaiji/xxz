import * as THREE from 'three-platformize'
import { OrbitControls } from 'three-platformize/examples/jsm/controls/OrbitControls'
import { TweenMax, Power0 } from 'gsap';

const init = () => {
  const root = new THREERoot({
    createCameraControls: !true,
    antialias: window.devicePixelRatio === 1,
    fov: 80,
  })

  root.renderer.setClearColor(0x000000, 0)
  root.renderer.setPixelRatio(window.devicePixelRatio || 1)
  root.camera.position.set(0, 0, 60)

  const width = 100
  const height = 60

  const slide = new Slide(width, height, 'out')
  const l1 = new THREE.ImageLoader()
  l1.setCrossOrigin('Anonymous')
  l1.load('../images/winter.jpg', function (img) {
    slide.setImage(img)
  })
  root.scene.add(slide)

  const slide2 = new Slide(width, height, 'in')
  const l2 = new THREE.ImageLoader()
  l2.setCrossOrigin('Anonymous')
  l2.load('../images/spring.png', function (img) {
    slide2.setImage(img)
  })

  root.scene.add(slide2)

  const tl = new TimelineMax({ repeat: -1, repeatDelay: 1.0, yoyo: true })

  tl.add(slide.transition(), 0)
  tl.add(slide2.transition(), 0)

  createTweenScrubber(tl)

  window.addEventListener('keyup', function (e) {
    if (e.keyCode === 80) {
      tl.paused(!tl.paused())
    }
  })
}

////////////////////
// CLASSES
////////////////////

class Slide extends THREE.Mesh {
  totalDuration: number;
  private material: THREE.ShaderMaterial;

  constructor(width: number, height: number, animationPhase: 'in' | 'out') {
    // Create the base plane geometry
    const plane = new THREE.PlaneGeometry(width, height, width * 2, height * 2);

    // Separate faces of the plane
    THREE.BAS.Utils.separateFaces(plane);

    // Custom SlideGeometry class (assumed to be defined elsewhere)
    const geometry = new SlideGeometry(plane);
    geometry.bufferUVs();

    // Create attributes for the geometry
    const aAnimation = geometry.createAttribute('aAnimation', 2);
    const aStartPosition = geometry.createAttribute('aStartPosition', 3);
    const aControl0 = geometry.createAttribute('aControl0', 3);
    const aControl1 = geometry.createAttribute('aControl1', 3);
    const aEndPosition = geometry.createAttribute('aEndPosition', 3);

    let i: number, i2: number, i3: number, i4: number, v: number;

    // Constants for the animation
    const minDuration = 0.8;
    const maxDuration = 1.2;
    const maxDelayX = 0.9;
    const maxDelayY = 0.125;
    const stretch = 0.11;

    // Total duration for the animation
    this.totalDuration = maxDuration + maxDelayX + maxDelayY + stretch;

    const startPosition = new THREE.Vector3();
    const control0 = new THREE.Vector3();
    const control1 = new THREE.Vector3();
    const endPosition = new THREE.Vector3();

    const tempPoint = new THREE.Vector3();

    // Helper functions for control points
    const getControlPoint0 = (centroid: THREE.Vector3): THREE.Vector3 => {
      const signY = Math.sign(centroid.y);

      tempPoint.set(
        THREE.Math.randFloat(0.1, 0.3) * 50,
        signY * THREE.Math.randFloat(0.1, 0.3) * 70,
        THREE.Math.randFloatSpread(20)
      );

      return tempPoint;
    };

    const getControlPoint1 = (centroid: THREE.Vector3): THREE.Vector3 => {
      const signY = Math.sign(centroid.y);

      tempPoint.set(
        THREE.Math.randFloat(0.3, 0.6) * 50,
        -signY * THREE.Math.randFloat(0.3, 0.6) * 70,
        THREE.Math.randFloatSpread(20)
      );

      return tempPoint;
    };

    // Loop through the faces and calculate the animation
    for (i = 0, i2 = 0, i3 = 0, i4 = 0; i < geometry.faceCount; i++, i2 += 6, i3 += 9, i4 += 12) {
      const face = plane.faces[i];
      const centroid = THREE.BAS.Utils.computeCentroid(plane, face);

      // Animation parameters
      const duration = THREE.Math.randFloat(minDuration, maxDuration);
      const delayX = THREE.Math.mapLinear(centroid.x, -width * 0.5, width * 0.5, 0.0, maxDelayX);
      let delayY: number;

      // Handle the phase of the animation
      if (animationPhase === 'in') {
        delayY = THREE.Math.mapLinear(Math.abs(centroid.y), 0, height * 0.5, 0.0, maxDelayY);
      } else {
        delayY = THREE.Math.mapLinear(Math.abs(centroid.y), 0, height * 0.5, maxDelayY, 0.0);
      }

      // Store animation data
      for (v = 0; v < 6; v += 2) {
        aAnimation.array[i2 + v] = delayX + delayY + Math.random() * stretch * duration;
        aAnimation.array[i2 + v + 1] = duration;
      }

      // Compute start, control, and end positions
      endPosition.copy(centroid);
      startPosition.copy(centroid);

      if (animationPhase === 'in') {
        control0.copy(centroid).sub(getControlPoint0(centroid));
        control1.copy(centroid).sub(getControlPoint1(centroid));
      } else {
        // 'out' phase
        control0.copy(centroid).add(getControlPoint0(centroid));
        control1.copy(centroid).add(getControlPoint1(centroid));
      }

      // Store position data
      for (v = 0; v < 9; v += 3) {
        aStartPosition.array[i3 + v] = startPosition.x;
        aStartPosition.array[i3 + v + 1] = startPosition.y;
        aStartPosition.array[i3 + v + 2] = startPosition.z;

        aControl0.array[i3 + v] = control0.x;
        aControl0.array[i3 + v + 1] = control0.y;
        aControl0.array[i3 + v + 2] = control0.z;

        aControl1.array[i3 + v] = control1.x;
        aControl1.array[i3 + v + 1] = control1.y;
        aControl1.array[i3 + v + 2] = control1.z;

        aEndPosition.array[i3 + v] = endPosition.x;
        aEndPosition.array[i3 + v + 1] = endPosition.y;
        aEndPosition.array[i3 + v + 2] = endPosition.z;
      }
    }

    // Create the material for the slide
    this.material = new THREE.BAS.BasicAnimationMaterial(
      {
        shading: THREE.FlatShading,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { type: 'f', value: 0 },
        },
        shaderFunctions: [
          THREE.BAS.ShaderChunk['cubic_bezier'],
          THREE.BAS.ShaderChunk['ease_in_out_cubic'],
          THREE.BAS.ShaderChunk['quaternion_rotation'],
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
      }
    );

    // Call the parent constructor (THREE.Mesh)
    super(geometry, this.material);
    this.frustumCulled = false;
  }

  // Getter and setter for 'time' property
  get time(): number {
    return this.material.uniforms['uTime'].value;
  }

  set time(v: number) {
    this.material.uniforms['uTime'].value = v;
  }

  // Method to set image on the slide
  setImage(image: HTMLImageElement): void {
    this.material.uniforms.map.value.image = image;
    this.material.uniforms.map.value.needsUpdate = true;
  }

  // Method to create a transition effect
  transition(): any {
    return TweenMax.fromTo(
      this,
      3.0,
      { time: 0.0 },
      { time: this.totalDuration, ease: Power0.easeInOut }
    );
  }
}


function SlideGeometry(model) {
  THREE.BAS.ModelBufferGeometry.call(this, model)
}
SlideGeometry.prototype = Object.create(THREE.BAS.ModelBufferGeometry.prototype)
SlideGeometry.prototype.constructor = SlideGeometry
SlideGeometry.prototype.bufferPositions = function () {
  const positionBuffer = this.createAttribute('position', 3).array

  for (let i = 0; i < this.faceCount; i++) {
    const face = this.modelGeometry.faces[i]
    const centroid = THREE.BAS.Utils.computeCentroid(this.modelGeometry, face)

    const a = this.modelGeometry.vertices[face.a]
    const b = this.modelGeometry.vertices[face.b]
    const c = this.modelGeometry.vertices[face.c]

    positionBuffer[face.a * 3] = a.x - centroid.x
    positionBuffer[face.a * 3 + 1] = a.y - centroid.y
    positionBuffer[face.a * 3 + 2] = a.z - centroid.z

    positionBuffer[face.b * 3] = b.x - centroid.x
    positionBuffer[face.b * 3 + 1] = b.y - centroid.y
    positionBuffer[face.b * 3 + 2] = b.z - centroid.z

    positionBuffer[face.c * 3] = c.x - centroid.x
    positionBuffer[face.c * 3 + 1] = c.y - centroid.y
    positionBuffer[face.c * 3 + 2] = c.z - centroid.z
  }
}


interface THREERootParams {
  fov?: number
  zNear?: number
  zFar?: number
  createCameraControls?: boolean
  antialias?: boolean
}

class THREERoot {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls?: OrbitControls

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

    this.renderer = new THREE.WebGLRenderer({
      antialias: params.antialias,
      alpha: true,
    })

    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))

    this.camera = new THREE.PerspectiveCamera(
      params.fov,
      window.innerWidth / window.innerHeight,
      params.zNear,
      params.zfar,
    )

    this.scene = new THREE.Scene()

    if (params.createCameraControls) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    }

    this.resize = this.resize.bind(this)
    this.tick = this.tick.bind(this)

    this.resize()
    this.tick()

    window.addEventListener('resize', this.resize, false)
  }

  tick(): void {
    this.update()
    this.render()
    requestAnimationFrame(this.tick)
  }

  update(): void {
    this.controls?.update()
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

////////////////////
// UTILS
////////////////////

var utils = {
  // 源对象src中的所有属性复制到目标对象dst
  extend: function (dst, src) {
    for (const key in src) {
      dst[key] = src[key]
    }

    return dst
  },
  // 返回一个随机的符号，1或-1
  randSign: function () {
    return Math.random() > 0.5 ? 1 : -1
  },
  // 动画缓动函数
  /**
   * 使用给定的缓动函数ease来计算当前时间t下的位置
   * @param {缓动函数} ease
   * @param {当前时间} t
   * @param {初始位置} b
   * @param {变化量} c
   * @param {总时间} d
   * @returns
   */
  ease: function (ease, t, b, c, d) {
    return b + ease.getRatio(t / d) * c
  },
  // 返回一个函数，该函数根据斐波那契球面分割算法生成一个三维空间中的点,该方法使用闭包来保存一些计算中使用的常量和变量
  fibSpherePoint: (function () {
    const vec = { x: 0, y: 0, z: 0 }
    const G = Math.PI * (3 - Math.sqrt(5))

    return function (i, n, radius) {
      const step = 2.0 / n
      let r, phi

      vec.y = i * step - 1 + step * 0.5
      r = Math.sqrt(1 - vec.y * vec.y)
      phi = i * G
      vec.x = Math.cos(phi) * r
      vec.z = Math.sin(phi) * r

      radius = radius || 1

      vec.x *= radius
      vec.y *= radius
      vec.z *= radius

      return vec
    }
  })(),
  // 返回一个函数，该函数生成一个单位球面上的随机点
  spherePoint: (function () {
    return function (u, v) {
      u === undefined && (u = Math.random())
      v === undefined && (v = Math.random())

      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)

      const vec = {}
      vec.x = Math.sin(phi) * Math.cos(theta)
      vec.y = Math.sin(phi) * Math.sin(theta)
      vec.z = Math.cos(phi)

      return vec
    }
  })(),
}

function createTweenScrubber(tween, seekSpeed) {
  seekSpeed = seekSpeed || 0.001

  function stop() {
    TweenMax.to(tween, 1, { timeScale: 0 })
  }

  function resume() {
    TweenMax.to(tween, 1, { timeScale: 1 })
  }

  function seek(dx) {
    const progress = tween.progress()
    const p = THREE.Math.clamp(progress + dx * seekSpeed, 0, 1)

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
