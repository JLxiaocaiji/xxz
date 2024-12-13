<template>
  <LoadingCom v-if="isLoading" styleName="" />
  <view>
    <canvas
      class="webgl"
      type="webgl"
      id="gl"
      style="width: 100vw; height: 100vh"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    />
  </view>
</template>

<script lang="ts" setup>
import * as THREE from 'three-platformize'
import { onLoad, onReady, onUnload } from '@dcloudio/uni-app'
import type { NodesRef } from '@dcloudio/uni-types'
import { getCurrentInstance, ref, nextTick } from 'vue'
import { WechatPlatform } from 'three-platformize/src/WechatPlatform'
import { useDeviceConfigStore } from '@/store'
import { THREERoot } from './index'
import type { Position } from '@/types/device'
import LoadingCom from '@/components/LoadingCom/index.vue'
import { useStatusStore } from '@/store'
import { storeToRefs } from 'pinia'
import { OrbitControls } from 'three-platformize/examples/jsm/controls/OrbitControls'
import { $cancelAnimationFrame, $requestAnimationFrame } from 'three-platformize'

const { isLoading } = storeToRefs(useStatusStore())

onReady(() => {
  uni
    .createSelectorQuery()
    .in(getCurrentInstance())
    .select('#gl')
    .fields(
      {
        id: true,
        dataset: true,
        rect: true,
        size: true,
        scrollOffset: true,
        context: true,
        node: true,
      },
      (res: NodesRef) => {
        console.log(res)
        console.log(res.node)
        init(res?.node)
      },
    )
    .exec()
})

// 获取屏幕信息
const deviceConfigStore = useDeviceConfigStore()
const deviceInfo = deviceConfigStore.deviceInfo

var platform: WechatPlatform

const initThree = (canvas: HTMLCanvasElement) => {
  platform = new WechatPlatform(canvas) // webgl canvasNode
  platform.enableDeviceOrientation('game')
  THREE.PLATFORM.set(platform)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    80,
    deviceInfo.windowWidth / deviceInfo.windowHeight,
    0.1,
    1000,
  )
  const cameraPosArr = new THREE.Vector3().fromArray([0, 0, 100])
  camera.position.set(cameraPosArr.x, cameraPosArr.y, cameraPosArr.z)

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(2, deviceInfo.pixelRatio || 1))

  const controls = new OrbitControls(camera, canvas)
  // this.controls.enableDamping = true // 启用阻尼，平滑过渡
  controls.dampingFactor = 0.25 // 设置阻尼因子
  controls.minPolarAngle = Math.PI / 2
  controls.maxPolarAngle = Math.PI / 2

  // 资源加载优化
  const loadingManager = new THREE.LoadingManager()
  const envMapTexture = new THREE.CubeTextureLoader(loadingManager)
    .setPath('../../static/images/envMaps/')
    .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
  loadingManager.onLoad = () => {
    isLoading.value = false
  }
  const material = new THREE.MeshStandardMaterial({
    metalness: 0.7,
    roughness: 0.1,
    // envMap属性被设置为之前加载的立方体贴图，这样材质就能反射出加载的环境映射
    envMap: envMapTexture,
    transparent: true, // 透明度
    opacity: 0,
  })

  scene.background = envMapTexture
  scene.environment = envMapTexture
  const geometry = new THREE.SphereGeometry(1, 1, 1)
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // sprite
  const createSprite = (spriteImg: string, time: number, posArr: THREE.Vector3) => {
    const spriteTexture = new THREE.TextureLoader().load(spriteImg)
    spriteTexture.wrapS = THREE.ClampToEdgeWrapping
    spriteTexture.wrapT = THREE.ClampToEdgeWrapping
    spriteTexture.minFilter = THREE.LinearFilter
    spriteTexture.magFilter = THREE.LinearFilter
    const spriteMaterial = new THREE.SpriteMaterial({
      map: spriteTexture,
      transparent: true,
      opacity: 1.0, // 初始透明度
      alphaTest: 0.5, // 可选，确保透明区域不渲染
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(16, 16, 1)
    let pos = new THREE.Vector3().fromArray(posArr)
    sprite.position.set(pos.x, pos.y, pos.z)
    scene.add(sprite)

    let t = time

    const spriteAnimate = (isShining: boolean) => {
      if (isShining) {
        t += 0.005
        spriteMaterial.opacity = Math.abs(Math.sin(t)) * 0.5 + 0.5
      } else {
        spriteMaterial.opacity = 1
      }
    }
    shiningSprite.value = sprite
    return spriteAnimate
  }
  return { scene, camera, renderer, controls, createSprite }
}

const disposing = ref<boolean>(false)
var frameId: any
var Camera: THREE.PerspectiveCamera

const shiningSprite = ref(null)

const init = (canvas: HTMLCanvasElement) => {
  const { scene, camera, renderer, controls, createSprite } = initThree(canvas)
  Camera = camera
  let spriteAnimate = createSprite('../../static/images/logo.jpg', 0, [20, 20, 0])

  console.log(spriteAnimate)
  console.log(scene)
  const render = () => {
    // controls?.update()

    console.log(11)
    raycaster.setFromCamera(pointer, Camera)
    console.log(22)
    console.log(pointer)
    console.log(shiningSprite.value)
    const intersects = raycaster.intersectObject(shiningSprite.value)

    console.log('intersects')
    console.log(intersects)

    if (intersects.length > 0) {
      // 点击精灵时停止闪烁
      isShining.value = false
    }

    spriteAnimate(isShining.value)

    if (!disposing.value) {
      frameId = $requestAnimationFrame(render)
    }

    renderer.render(scene, camera)
  }

  render()
}

const startPos = ref<Position>({
  x: 0,
  y: 0,
})
const cameraRotation = ref<Position>({
  x: 0,
  y: 0,
})

// 单指角度变化
const isTouching = ref<boolean>(false)
// 双指缩放变化
const isScaling = ref<boolean>(false)
const touchStartDist = ref<number>(0)

// 计算两点之间的距离
const getDistance = (touch1: Touch, touch2: Touch) => {
  const dx = touch2.pageX - touch1.pageX
  const dy = touch2.pageY - touch1.pageY
  return Math.sqrt(dx * dx + dy * dy)
}

const isShining = ref<boolean>(true)
// 监听鼠标点击事件
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

// 附带 点击sprite 检测
const touchStart = (e: TouchEvent) => {
  console.log(e)
  if (e.touches.length == 1) {
    isTouching.value = true
    startPos.value.x = e.touches[0].pageX
    startPos.value.y = e.touches[0].pageX
  } else if (e.touches.length === 2) {
    isScaling.value = true
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    touchStartDist.value = getDistance(touch1, touch2)
  }

  pointer.x = (e.touches[0].clientX / deviceInfo.windowWidth) * 2 - 1
  pointer.y = -(e.touches[0].clientY / deviceInfo.windowHeight) * 2 + 1
}
const touchMove = (e: TouchEvent) => {
  if (!isTouching.value) return

  // 单指
  if (e.touches.length === 1 && isTouching.value) {
    let deltaX = e.touches[0].pageX - startPos.value.x
    let deltaY = e.touches[0].pageY - startPos.value.y

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      // 左右角度变化
      cameraRotation.value.x += deltaX * 0.005
      // 上下角度变化
      cameraRotation.value.y -= deltaY * 0.005
    }
    // 限制竖直方向的旋转范围，防止镜头翻转
    cameraRotation.value.y = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraRotation.value.y))
    // camera.rotation.set(cameraRotation.value.y, cameraRotation.value.x, 0)
    // 限制上下
    Camera.rotation.set(0, cameraRotation.value.x, 0)

    startPos.value.x = e.touches[0].pageX
    startPos.value.y = e.touches[0].pageY
  }
  // 双指
  else if (e.touches.length === 2 && isScaling.value) {
    let touch1 = e.touches[0]
    let touch2 = e.touches[1]
    let currentDist = getDistance(touch1, touch2)
    Camera.position.z *= currentDist / touchStartDist.value
    touchStartDist.value = currentDist
  }
}
const touchEnd = (e: TouchEvent) => {
  isTouching.value = false
  isScaling.value = false
}

onUnload(() => {
  disposing.value = true
  $cancelAnimationFrame(frameId)
  THREE.PLATFORM.dispose()
})
</script>

<style lang="scss" scoped></style>
