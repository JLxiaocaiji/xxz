<template>
  <LoadingCom v-if="isLoading" styleName="" />
  <view @touchstart="touchStart" @touchend="touchEnd" @click="click" class="bg">
    <view class="book" :style="{ index: index }">
      <!-- 书 前封面 -->
      <view class="cover-front" :style="{ '--index': index }" :class="[index >= 1 ? 'flip' : '']">
        <!-- 书前封面 前半页 -->
        <view class="front-f">
          <!-- 书标题 -->
          <view class="title"> title </view>
        </view>

        <view class="front-b">
          <!-- 书前封面的后页面的白纸部分 -->
          <view class="book__insert"></view>
        </view>
      </view>

      <!-- 书后封面 -->
      <view class="cover-back" :style="{ '--index': index }" :class="[index >= 2 ? 'flip' : '']">
        <view class="back-f"></view>
        <view class="back-b">
          <view>end</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue'
import type { Position } from '@/types/device'
import { useStatusStore } from '@/store'
import { onMounted } from 'vue'
import LoadingCom from '@/components/LoadingCom/index.vue'
import { storeToRefs } from 'pinia'

const imageList = [
  '../../static/images/images/2.jpg',
  '../../static/images/images/3.jpg',
  '../../static/images/images/4.jpg',
]

const startPos = ref<Position>({
  x: 0,
  y: 0,
})

// 显示的图片
const index = ref<number>(0)

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

const click = (e: any) => {}

const { isLoading } = storeToRefs(useStatusStore())
setTimeout(() => {
  isLoading.value = false
}, 1000)

</script>

<style lang="scss" scoped>
.bg {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100vh;
}
.book {
  perspective: 1200px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@mixin style {
  width: 180px;
  height: 400px;
  left: 50%;
  transform-style: preserve-3d;
  transition: 2s; /* 动画时间 */
  transform-origin: left;
}
@mixin style-f {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 背面不可见 */
  border-radius: 0 5% 5% 0;
}
@mixin style-b {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 背面不可见 */
  transform: rotateY(-180deg);
  border-radius: 5% 0 0 5%;
}

.cover-front {
  position: relative;
  @include style;
  z-index: calc(2 - var(--index));
    box-shadow: inset 300px 0 50px rgba(0, 0, 0, 0.5);

  .front-f {
    @include style-f;
    .title {
      color: #fff;
    }
    background: lightblue;
    box-shadow: inset 20px 0 50px rgba(0, 0, 0, 0.5);
  }
  .front-b {
    @include style-b;
    background: lightgreen;
    box-shadow: inset 20px 0 50px rgba(0, 0, 0, 0.5);
  }
}

.flip {
  transform: rotateY(-180deg);
}

.cover-back {
  position: absolute;
  @include style;
  top: 0;
  z-index: var(--index);

  .back-f {
    @include style-f;
    background: rgb(112, 140, 150);
  }
  .back-b {
    @include style-b;
    background: rgb(75, 124, 75);
  }
}
</style>
