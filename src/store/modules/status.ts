import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStatusStore = defineStore('status', () => {
  const isLoading = ref<boolean>(true)

  const setIsLoading = (bool: boolean) => {
    isLoading.value = bool
  }

  /*
  const { isLoading } = storeToRefs(a)
  const { setIsLoading } = a
  setTimeout(() => {
    // setIsLoading(false)
    isLoading.value = false
    console.log(isLoading)
  }, 2000)
  */

  return {
    isLoading,
    setIsLoading,
  }
})
