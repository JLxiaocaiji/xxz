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

var R: THREERoot
var platform: WechatPlatform

const init = (canvas: HTMLCanvasElement) => {
  platform = new WechatPlatform(canvas) // webgl canvasNode
  platform.enableDeviceOrientation('game')
  THREE.PLATFORM.set(platform)

  const deviceInfo = deviceConfigStore.deviceInfo
  console.log(deviceInfo.pixelRatio)

  const root = new THREERoot({
    antialias: false,
    fov: 80,
    deviceInfo: deviceInfo,
    canvas: canvas,
  })

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

  root.scene.background = envMapTexture
  root.scene.environment = envMapTexture
  const geometry = new THREE.SphereGeometry(1, 1, 1)
  const mesh = new THREE.Mesh(geometry, material)
  root.scene.add(mesh)

  R = root
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

const touchStart = (e: TouchEvent) => {
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
    R.camera.rotation.set(cameraRotation.value.y, cameraRotation.value.x, 0)

    startPos.value.x = e.touches[0].pageX
    startPos.value.y = e.touches[0].pageY
  }
  // 双指
  else if (e.touches.length === 2 && isScaling.value) {
    let touch1 = e.touches[0]
    let touch2 = e.touches[1]
    let currentDist = getDistance(touch1, touch2)
    R.camera.position.z *= currentDist / touchStartDist.value
    touchStartDist.value = currentDist
  }
}
const touchEnd = (e: TouchEvent) => {
  console.log(R)
  console.log(e)
  console.log(cameraRotation.value)
  console.log(startPos.value)
  isTouching.value = false
  isScaling.value = false
}

onUnload(() => {
  R.getInstance().dispose()
  THREE.PLATFORM.dispose()
})
</script>

<style lang="scss" scoped></style>
