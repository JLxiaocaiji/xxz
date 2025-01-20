<template>
  <view>
    <view class="title">
      <view>好久不见，婚礼见丨{{ couple[0].name }}"&"{{ couple[1].name }}</view>
      <view>我们结婚啦~</view>
    </view>
    <view class="desc">
      <text class="author">{{ app.globalData.publisher }}</text>
      <text class="date">{{ app.globalData.weddingTimeStr }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue"

const couple = ref<string[]>()
const app = getApp() as any
couple.value = app.globalData.couple.map((item: string) => {
  return item
})

</script>

<style lang="scss" scoped>
.title {
    font-size: 36rpx;
    margin-bottom: 28rpx;
    letter-spacing: 4rpx;
    line-height: 1.5;
}
</style>
