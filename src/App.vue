<script>
import { useBaseConfigStore } from '@/store'

export default {
  onLaunch: function () {
    const baseConfigStore = useBaseConfigStore()
    baseConfigStore.batchSetDeviceInfo(uni.getSystemInfoSync())
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
</style>
