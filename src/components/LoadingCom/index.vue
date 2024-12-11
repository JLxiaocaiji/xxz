<template>
  <view class="loader">
    <view class="spinner">
      <image
        :src="imgUrl || '../../static/images/images/10.gif'"
        mode="scaleToFill"
        :style="imgStyle"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  imgUrl?: string
  styleName?: string
}>()

const imgStyle = computed(() => {
  if (props.styleName) {
    return props.styleName.toString()
  } else {
    return ''
  }
})
</script>

<style scoped>
.loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 1);
  z-index: 99;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  /* border-top: 4px solid #3498db; */
  border-radius: 50%;
  /* width: 50px;
  height: 50px; */
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
