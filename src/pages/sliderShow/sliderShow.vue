<template>
  <view>
    <view class="image" />

    <view class="left-list">

    </view>
    <view class="right-list">

    </view>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReady } from '@dcloudio/uni-app'
import { ref } from "vue"

const imageList = Object.values(
  import.meta.glob('../../static/images/images/*.*', { eager: true }),
).map((v: any) => v.default)

onReady(() => {
  console.log(imageList)
})


const leftList = ref<string[]>([])
const rightList = ref<string[]>(imageList)
</script>

<style lang="scss" scoped></style>
