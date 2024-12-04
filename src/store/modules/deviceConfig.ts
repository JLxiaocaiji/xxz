import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DeviceInfo } from '@/types/device'

export const deviceConfig = defineStore(
  'deviceConfig',
  () => {
    const deviceInfo = ref<DeviceInfo>({
      pixelRatio: 0,
      screenWidth: 0,
      screenHeight: 0,
      windowWidth: 0,
      windowHeight: 0,
      windowTop: 0,
      windowBottom: 0,
    })

    const setDeviceInfo = (k: keyof DeviceInfo, v: number) => {
      deviceInfo.value[k] = v
    }

    return {
      deviceInfo,
      setDeviceInfo,
    }
  },
  {
    // 网页端配置
    // persist: true,
    // 小程序端配置
    persist: {
      storage: {
        getItem(key) {
          return uni.getStorageSync(key)
        },
        setItem(key, value) {
          uni.setStorageSync(key, value)
        },
      },
    },
  },
)
