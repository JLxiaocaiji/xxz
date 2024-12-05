<template>
  <view style="backgroundcolor: red">
    <image
      class="image"
      mode="scaleToFill"
      :src="curImg"
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
import { ref, computed } from 'vue'
import type { Position } from '@/types/device'

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
const curImg = ref<string>(imageList.shift())
let tempRight = imageList
const right = ref<string[]>(tempRight )
const rightList = computed(() => {
  console.log("right.value")
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

const touchEnd = (e: any) => {
  let endPos = e.changedTouches[0].clientX

  if (endPos - startPos.value.x > 50) {
    moveDirection.value = 'right'
    console.log('右滑')

    if (left.value.length == 0) {
      return
    } else {
      curImg.value = left.value.shift()
      right.value.push(curImg.value)
    }
    console.log(right.value)
    console.log(left.value)
  } else if (endPos - startPos.value.x < -50) {
    console.log('左滑')
    moveDirection.value = 'left'

    if (right.value.length == 0) {
      return
    } else {
      curImg.value = right.value.shift()
      left.value.push(curImg.value)
    }

    console.log(right.value)
    console.log(left.value)
  }
}
</script>

<style lang="scss" scoped>
uni-image {
  border-radius: 20rpx;
  box-shadow: 0 0 10rpx #000;
}

.image {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  // inset: 40rpx 0rpx;
  margin-top: 5%;

  height: 90%;
}

.image-list {
  width: 400rpx;
  height: 250rpx;
  display: flex;
  // overflow: hidden;

  image {
    width: 200rpx;
    height: 100%;
    &:nth-child(1) {
      z-index: 3;
    }
    &:nth-child(2) {
      margin-left: -35%;
      z-index: 2;
    }
    &:nth-child(3) {
      margin-left: -30%;
      z-index: 1;
    }
  }
}

.left-list {
  @extend .image-list;
  position: absolute;
  right: 60%;
  bottom: 5%;
}

.right-list {
  @extend .image-list;
  position: absolute;
  left: 60%;
  bottom: 5%;
}
</style>
