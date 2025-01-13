<script>
import { useBaseConfigStore } from '@/store'

export default {
  globalData: {
    // 婚礼日期时间
    weddingTime: '2025-03-09 18:16:00',
    // 双方信息
    couple: [
      {
        image: '', // 新郎单人照
        name: 'JL', // 姓名
        alias: '新郎', // 称谓
      },
      {
        image: '', // 新娘单人照
        name: 'QXX', // 姓名
        alias: '新娘', // 称谓
      },
    ],
    // 发布者（自己想个你俩人的噱头组合名呗）
    publisher: 'QXX&&JL',
  },
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
