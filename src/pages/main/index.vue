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

    <view>
      <uni-calendar
        class="uni-calendar--hook"
        :selected="calendar.selected"
        :selected-bg-color="'#FF5722'"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const couple = ref<string[]>()
const app = getApp() as any
couple.value = app.globalData.couple.map((item: string) => {
  return item
})

// 日历
const calendar = ref({
  lunar: true,  // 显示农历
  range: true,  // 范围选择
  insert: false,  // 插入模式 / 弹窗模式
  selected: [], // 打点
})

</script>

<style lang="scss" scoped>
.title {
  font-size: 36rpx;
  margin-bottom: 28rpx;
  letter-spacing: 4rpx;
  line-height: 1.5;
}

.desc {
  font-size: 28rpx;
  margin-bottom: 44rpx;
}

// 日历
.uni-calendar__day--selected {
    background-color: #FF5722;
    color: #FFFFFF;
}
</style>
