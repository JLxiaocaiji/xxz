import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DeviceInfo } from '@/types/device'

export const useBaseConfigStore = defineStore(
  'baseInfo',
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

    const batchSetDeviceInfo = (obj: Record<string, number>) => {
      Object.keys(deviceInfo.value).forEach((key: string) => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          deviceInfo.value[key as keyof DeviceInfo] = obj[key]
        }
      })
    }

    const token = ref<string | null>(null)

    const setToken = (val: string) => {
      token.value = val
    }

    return {
      deviceInfo,
      setDeviceInfo,
      batchSetDeviceInfo,

      token,
      setToken,
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
