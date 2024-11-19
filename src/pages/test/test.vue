<template>
  <view
    >111
    <view id="app">
      <canvas class="webgl" type="webgl" id="gl"></canvas>
    </view>
  </view>
</template>

<script lang="ts" setup>
import * as THREE from 'three-platformize'
import { onLoad, onReady, NodesRef } from '@dcloudio/uni-app'
import { getCurrentInstance, ref } from 'vue'
import { WechatPlatform } from 'three-platformize/src/WechatPlatform'
import { OrbitControls } from 'three-platformize/examples/jsm/controls/OrbitControls'
import type { WindowInfo } from '@/types/window.d'
import { show } from "./index"

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
        console.log(res?.node)
        console.log(1111)
        init(res?.node)
      },
    )
    .exec()
})

const windowInfo = ref<WindowInfo>({
  windowWidth: 0,
  windowHeight: 0,
})

// 获取屏幕信息
const getWindowInfo = () => {
  let tempWindowInfo = uni.getSystemInfoSync()
  windowInfo.value.windowWidth = tempWindowInfo.windowWidth
  windowInfo.value.windowHeight = tempWindowInfo.windowHeight
}

const init = (node: NodesRef) => {
  console.log(3333)
  console.log(node)
  const platform = new WechatPlatform(node) // webgl canvasNode
  platform.enableDeviceOrientation('game')
  THREE.PLATFORM.set(platform)

  // show()
}
</script>

<style lang="scss" scoped></style>
