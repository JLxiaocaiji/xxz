<template>
  <view id="app">
    <canvas
      class="webgl"
      type="webgl"
      id="gl"
      style="width: 100vw; height: 100vh"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    ></canvas>
  </view>
</template>

<script lang="ts" setup>
import * as THREE from 'three-platformize'
import { onLoad, onReady, onUnload } from '@dcloudio/uni-app'
import type { NodesRef } from '@dcloudio/uni-types'
import { getCurrentInstance, ref, nextTick } from 'vue'
import { WechatPlatform } from 'three-platformize/src/WechatPlatform'
import type { DeviceInfo } from '@/types/device'
import { show } from './index'
import { useBaseConfigStore } from '@/store'
import type { Position } from '@/types/device'
import { THREERoot, Slide } from './index'

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
        init(res?.node)
      },
    )
    .exec()
})

const windowInfo = ref<DeviceInfo>({
  windowWidth: 0,
  windowHeight: 0,
})

const init = (canvas: HTMLCanvasElement) => {
  const platform = new WechatPlatform(canvas) // webgl canvasNode
  platform.enableDeviceOrientation('game')
  THREE.PLATFORM.set(platform)

  getWindowInfo(canvas)
}

// 获取屏幕信息
const baseConfigStore = useBaseConfigStore()

// 加载 image
const setImage = (url: string, slide: Slide) => {
    const l = new THREE.ImageLoader()
  l.load(
    url,
    (image) => {
      console.log('image')
      console.log(image)
      slide.setImage(image)
    },
    undefined,
    (e: Error) => {
      console.error('error: ', e)
    },
  )
  return slide
}

var slide1 = null
var slide2 = null

const getWindowInfo = (canvas: HTMLCanvasElement) => {
  let tempWindowInfo = baseConfigStore.deviceInfo
  console.log(tempWindowInfo)
  windowInfo.value.windowWidth = tempWindowInfo.windowWidth // 402
  windowInfo.value.windowHeight = tempWindowInfo.windowHeight // 728

  // nextTick(() => {
  //   show({ ...tempWindowInfo }, canvas)
  // })

  const root = new THREERoot({
    createCameraControls: !true,
    antialias: tempWindowInfo.pixelRatio === 1,
    fov: 80,
    deviceInfo: tempWindowInfo,
  })

  const width = 40,
    height = 90

  slide1 = setImage( '../../static/images/湘湘.png', new Slide(width, height, "in"))
  slide2 = setImage( '../../static/images/logo.jpg', new Slide(width, height, "out"))
}

// 单指角度变化
const isTouching = ref<boolean>(false)
const startPos = ref<Position>({
  x: 0,
  y: 0,
})

const touchStart = (e: TouchEvent) => {
  console.log(e)
  if (e.touches.length == 1) {
    isTouching.value = true
    console.log(e.touches[0])
    console.log(e.touches[0].pageX)
    startPos.value.x = e.touches[0].pageX
    startPos.value.y = e.touches[0].pageY
  } else if (e.touches.length === 2) {
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
  }
}
const touchMove = (e: TouchEvent) => {
}
const touchEnd = (e: TouchEvent) => {
  isTouching.value = false
  let a = e.changedTouches[0].pageX - startPos.value.x > 0 ? 'right' : 'left'
  console.log(a)
  a == 'right' ? slide1.transition() : slide2.transition()
}

onUnload(() => {
  THREE.PLATFORM.dispose()
})
</script>

<style lang="scss" scoped></style>
@/types/device
