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
import { onLoad, onReady } from '@dcloudio/uni-app'
import { getCurrentInstance, ref } from 'vue'
import { WechatPlatform } from 'three-platformize/src/WechatPlatform'
import { OrbitControls } from 'three-platformize/examples/jsm/controls/OrbitControls'
import type { AddressParams } from '@/types/window.d'

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
      (res) => {
        console.log(res)
        console.log(1111)
      },
    )
    .exec((res) => {
      console.log(2222)
      console.log(res)
      console.log(res[0].node)

      init(res[0].node)
    })
})

const windowInfo = ref<AddressParams>({
  windowWidth: 0,
  windowHeight: 0,
})

// 获取屏幕信息
const getWindowInfo = () => {
  let tempWindowInfo = uni.getSystemInfoSync()
  windowInfo.value.windowWidth = tempWindowInfo.windowWidth
  windowInfo.value.windowHeight = tempWindowInfo.windowHeight
}

const init = (node: any) => {
  console.log(3333)
  console.log(node)
  const platform = new WechatPlatform(node) // webgl canvasNode
  platform.enableDeviceOrientation('game')
  THREE.PLATFORM.set(platform)

  show()
}

const show = () => {}
</script>

<style lang="scss" scoped></style>
