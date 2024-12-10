<template>
  <view class="view">
    <view class="image-list">
      <image
        v-for="(item, idx) in imageList"
        :key="item"
        :src="item"
        mode="scaleToFill"
        :class="getImageStyle(idx)"
        @touchstart="touchStart"
        @touchend="touchEnd"
        @click="index = idx"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReady } from '@dcloudio/uni-app'
import { ref, computed, nextTick } from 'vue'
import type { Position } from '@/types/device'
import { gsap } from 'gsap'

const imageList = Object.values(
  import.meta.glob('../../static/images/images/*.*', { eager: true }),
).map((v: any) => v.default)

onReady(() => {
  console.log(imageList)
})

// 显示的图片
const index = ref<number>(0)

// 滑动
const startPos = ref<Position>({
  x: 0,
  y: 0,
})

// 获取每个小图片的样式
const getImageStyle = (idx: number, side: 'left' | 'right') => {
  return idx == index.value - 3
    ? 'active-l3'
    : idx == index.value - 2
    ? 'active-l2'
    : idx == index.value - 1
    ? 'active-l1'
    : idx == index.value
    ? 'active'
    : idx == index.value + 1
    ? 'active-r1'
    : idx == index.value + 2
    ? 'active-r2'
    : idx == index.value + 3
    ? 'active-r3'
    : 'active-n'
}

const touchStart = (e: any) => {
  console.log(e)
  startPos.value.x = e.changedTouches[0].clientX
}

const touchEnd = (e: any) => {
  let endPos = e.changedTouches[0].clientX

  if (endPos - startPos.value.x > 50) {
    console.log('右滑')

    if (index.value == 0) {
      return
    } else {
      index.value--
    }
  } else if (endPos - startPos.value.x < -50) {
    console.log('左滑')

    if (index.value == imageList.length - 1) {
      return
    } else {
      index.value++
    }
  }
  console.log(index.value)
}
</script>

<style lang="scss" scoped>
image {
  border-radius: 20rpx;
  box-shadow: 0 0 10rpx #000;
}

.view {
  width: 100%;
  height: 100%;
  .image-list {
    image:not(.active) {
      position: absolute;
      bottom: 5%;
      width: 200rpx;
      height: 250rpx;
      position: absolute;
      transition: 0.8s;

      // transform-origin: bottom;
      transform-style: preserve-3d;
      -webkit-box-reflect: below 1px linear-gradient(transparent, transparent, #000);
    }
    .active {
      position: absolute;
      margin-top: 5%;
      width: 90%;
      left: 5%;
      height: 90%;
      &-l3 {
        left: 0;
        z-index: 1;
      }
      &-l2 {
        left: 5%;
        z-index: 2;
      }
      &-l1 {
        left: 10%;
        z-index: 3;
      }

      &-r3 {
        right: 0;
        z-index: 1;
      }
      &-r2 {
        right: 5%;
        z-index: 2;
      }
      &-r1 {
        right: 10%;
        z-index: 3;
      }
      &-n {
        display: none;
      }
    }
  }
}
</style>
