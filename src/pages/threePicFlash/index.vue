<template>
  <view id="app">
    <canvas
      class="webgl"
      type="webgl"
      id="gl"
      @touchstart="touchStart"
      style="width: 100vw; height: 100vh"
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

const getWindowInfo = (canvas: HTMLCanvasElement) => {
  let tempWindowInfo = baseConfigStore.deviceInfo
  console.log(tempWindowInfo)
  windowInfo.value.windowWidth = tempWindowInfo.windowWidth // 402
  windowInfo.value.windowHeight = tempWindowInfo.windowHeight // 728

  nextTick(() => {
    show({ ...tempWindowInfo }, canvas)
  })
}

const touchStart = (e: TouchEvent) => {
  // console.log(e)
}
const touchMove = (e: TouchEvent) => {
  // console.log(e)
  // this.platform.dispatchTouchEvent(e);
}
const touchEnd = (e: TouchEvent) => {
  // console.log(e)
}

onUnload(() => {
  THREE.PLATFORM.dispose();
})
</script>

<style lang="scss" scoped></style>
@/types/device
