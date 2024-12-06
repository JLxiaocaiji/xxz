<template>
  <view class="view">
    <image
      class="main-image"
      mode="scaleToFill"
      :src="imageList[index]"
      @touchstart="touchStart"
      @touchend="touchEnd"
    />

    <view class="left-list" v-if="leftList.length != 0">
      <image v-for="item in leftList" :key="item" :src="item" mode="scaleToFill" />
    </view>
    <view class="right-list" v-if="rightList.length != 0">
      <image v-for="item in rightList" :key="item" :src="item" mode="scaleToFill" />
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

const left = ref<string[]>([])
const leftList = computed(() => {
  return left.value.length > 3 ? left.value.slice(-3) : left.value
})

// 显示的图片
const index = ref<number>(0)
const right = ref<string[]>(imageList.slice(1))
const rightList = computed(() => {
  console.log('right.value')
  console.log(right.value)
  return right.value.length > 3 ? right.value.slice(0, 3) : right.value
})

// 滑动
const moveDirection = ref<string>('')
const startPos = ref<Position>({
  x: 0,
  y: 0,
})
const touchStart = (e: any) => {
  console.log(e)
  startPos.value.x = e.changedTouches[0].clientX
}

const tl = gsap.timeline({ repeat: 1 })

const touchEnd = (e: any) => {
  let endPos = e.changedTouches[0].clientX

  if (endPos - startPos.value.x > 50) {
    moveDirection.value = 'right'
    console.log('右滑')

    if (left.value.length == 0) {
      return
    } else {
      right.value.unshift(imageList[index.value])
      left.value.pop()
      index.value--
    }
  } else if (endPos - startPos.value.x < -50) {
    console.log('左滑')
    moveDirection.value = 'left'

    if (right.value.length == 0) {
      return
    } else {
      left.value.push(imageList[index.value])
      right.value.shift()
      index.value++
    }
  }
  console.log(right.value)
  console.log(left.value)
  console.log(index.value)
}
</script>

<style lang="scss" scoped>
uni-image {
  border-radius: 20rpx;
  box-shadow: 0 0 10rpx #000;
}

.view {
  display: flex;
  justify-content: center;
  .main-image {
    position: absolute;
    margin-top: 5%;
    height: 90%;
  }
}

@mixin position($pos) {
  width: 300rpx;
  height: 250rpx;
  display: flex;
  position: absolute;
  bottom: 5%;
  image {
    width: 200rpx;
    height: 100%;
    position: absolute;
    transition: 0.5s;
  }

  @if $pos == 'right' {
    image {
      &:nth-child(1) {
        z-index: 3;
      }
      &:nth-child(2) {
        transition: 0.5s;
        margin-left: 15%;
        z-index: 2;
      }
      &:nth-child(3) {
        // transition: 0.5s;
        margin-left: 30%;
        z-index: 1;
      }
    }
  } @else {
    image {
      &:nth-last-child(3) {
        z-index: 1;
      }
      &:nth-last-child(2) {
        z-index: 2;

        margin-left: 15%;
      }
      &:nth-last-child(1) {
        z-index: 3;
        margin-left: 30%;
      }
    }
  }
}

.left-list {
  @include position('left');
  left: 0;
}

.right-list {
  @include position('right');
  right: 0;
}
</style>
