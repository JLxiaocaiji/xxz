<template>
  <view>
    <!-- <view class="title">
      <view>好久不见，婚礼见丨{{ couple[0].name }}"&"{{ couple[1].name }}</view>
      <view>我们结婚啦~</view>
    </view>
    <view class="desc">
      <text class="author">{{ app.globalData.publisher }}</text>
      <text class="date">{{ app.globalData.weddingTimeStr }}</text>
    </view> -->

    <!-- <view class="cover-wrap">
      <image
        class="img-cover-word"
        src="https://h5cdn.hunbei.com/editorCustomPic/2023-5-5-XpF8Q3dtRTsbfzTY8WwBwFWpDhiGPe5k?imageMogr2/auto-orient/thumbnail/747x693>"
        mode="aspectFit"
      />
      <view class="cover">
        <image
          class="img-invitation"
          src="https://h5cdn.hunbei.com/editorCustomPic/2022-11-4-N87SPKmaSQW7kZ3i7ZH4QHeMXpYhZzDs.png?imageMogr2/auto-orient/crop/!1455x384a457a363/quality/90|imageMogr2/thumbnail/659x174>"
          mode="aspectFit"
        />
        <image class="img-cover" src="../../static/images/logo.jpg" mode="aspectFit" />
      </view>
      <view class="lh15">斯人若如虹，遇上方知有</view>
    </view> -->

    <!-- 音乐 -->
    <!-- <view class="music">
      <view :class="['music-controls', music.isPaused ? 'paused' : '']" @click="toggleMusic">
        <image src="../../static/images/icon/music.png" mode="aspectFit" />
      </view>
      <view class="music-left">
        <view class="music-title">{{ music.name }} - {{ music.singer }}</view>
        <view class="music-desc">Music</view>
      </view>
      <view class="music-right">
        <image
          class="music-status"
          src="https://h5cdn.hunbei.com/editorCustomPic/2022-5-25-dcdPDnJmTyZs5FbjdeWdXShEEYRkN6A4.gif?imageMogr2/auto-orient/thumbnail/48x34>"
          mode="aspectFit"
        />
        音乐封面
        <image class="music-poster" :src="imgs.poster" mode="aspectFit" />
      </view>
    </view> -->

    <!-- 日历 -->
    <!-- <view>
      <uni-calendar
        class="calendar"
        :selected="calendar.selected"
        :lunar="true"
        :showMonth="false"
        :date="calendar.date"
      />
    </view> -->

    <!-- 地图 -->
    <view class="location mb100">
      <view>
        <view>{{ location.name }}</view>
        <view>{{ location.address }}</view>
      </view>
      // #ifdef MP-WEIXIN
      <map
        :longitude="location.longitude"
        :latitude="location.latitude"
        :enable-zoom="false"
        :enable-scroll="false"
        markers="{{ location.markers }}"
      />
      <view class="location-mask" @click="openLocation"></view>
      <!-- 仅用于获取定位信息，获取后会打印到控制台并写入到粘贴板，正式发布时记得注释起来 -->
      <button type="primary" size="mini" @click="chooseLocation">到这里去</button>
      // #endif
    </view>

    <!-- uni.makePhoneCall -->
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

const couple = ref<string[]>()
const app = getApp() as any
couple.value = app.globalData.couple.map((item: string) => {
  return item
})

// 音乐
const music = ref({
  isPaused: false,
  name: '歌曲名',
  singer: '歌手',
})

// 照片
const imgs = ref({
  // 音乐封面
  poster: 'https://res.wx.qq.com/t/fed_upload/d811d254-e5d6-4c19-9ff8-77c4b6128137/poster.jpg',
})

const toggleMusic = () => {
  music.value.isPaused = !music.value.isPaused
}

// 日历
const calendar = ref({
  lunar: true, // 显示农历
  range: true, // 范围选择
  insert: false, // 插入模式 / 弹窗模式
  selected: [
    {
      date: '2025-3-9',
      info: '签到',
      data: {
        custom: '自定义信息',
        name: '自定义消息头',
      },
    },
  ], // 打点
  date: '2025-3-9',
})

// 地图
const location = ref({
  name: '名称',
  address: '地址',
  longitude: '120.7241439819336',
  latitude: '28.03387641906739',
})

const openLocation = () => {
  console.log(111)
  // uni.getLocation({
  //   type: 'wgs84', // 默认使用WGS84坐标系
  //   success: (res) => {
  //     console.log('当前位置：', res.latitude, res.longitude)
  //   },
  //   fail: (err) => {
  //     console.error('定位失败:', err)
  //   },
  // })
}

const chooseLocation = () => {
  console.log(222)
  // let url = `iosamap://navigate?sourceApplication=uniapp&lat=${this.latitude}&lon=${this.longitude}&dev=0`;
  // let url = `androidamap://route?sourceApplication=appname&slat=${originLat}&slon=${originLng}&sname=我的位置&dlat=${destinationLat}&dlon=${destinationLng}&dname=目的地&dev=0&t=0`;

  uni.getLocation({
    type: 'wgs84',
    success: (res) => {
      // 出发点
      let latitude = res.latitude
      let longitude = res.longitude
      console.log(res)

      uni.showActionSheet({
        itemList: ['A', 'B', 'C'],
        success: function (res) {
          const systemInfo = uni.getSystemInfoSync()
          const isAndroid = systemInfo.platform === 'android'
          const isIos = systemInfo.platform === 'ios'

          let url: any
          // 高德
          if (isAndroid) {
            url = `androidamap://route?sourceApplication=uniapp&dlat=${latitude}&dlon=${longitude}&dname=目的地&dev=0&t=0`
            url = `androidamap://route?sourceApplication=uniapp&dlat=${latitude}&dlon=${longitude}&dname=目的地&dev=0&t=0`
            // url = `androidamap://route?sourceApplication=uniapp&slat=${location.value.latitude}&slon=${location.value.longitude}&sname=我的位置&dlat=${latitude}&dlon=${longitude}&dname=目的地&dev=0&t=0`
          } else if (isIos) {
            // url = `iosamap://path?sourceApplication=uniapp&slat=${location.value.latitude}&slon=${location.value.longitude}&sname=我的位置&dlat=${latitude}&dlon=${longitude}&dname=目的地&dev=0&t=0`
            url = `iosamap://path?sourceApplication=uniapp&dlat=${latitude}&dlon=${longitude}&dname=目的地&dev=0&t=0`
          }

          console.log('选中了第' + (res.tapIndex + 1) + '个按钮')

          uni.getProvider({
            service: 'oauth',
            success: (res) => {
              console.log(res)
              console.log(url)
              // if (res.provider.includes('amap')) {

              uni.navigateTo({
                url,
                success: () => {
                  console.log('成功跳转高德地图导航')
                },
                fail: (err) => {
                  console.error('跳转高德地图导航失败', err)
                  uni.showToast({
                    title: '跳转高德地图导航失败',
                    icon: 'none',
                  })
                },
              })


              // } else {
              //   uni.showToast({
              //     title: '未安装高德地图应用',
              //     icon: 'none',
              //   })
              // }
            },
          })
        },
        fail: function (res) {
          console.log(res.errMsg)
        },
      })
    },
    fail: (err) => {
      console.error('获取位置失败', err)
      uni.showToast({
        title: '获取位置失败',
        icon: 'none',
      })
    },
  })
}
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
.cover-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .img-cover-word {
    position: absolute;
    left: 20rpx;
    bottom: 0;
    width: 498rpx;
    height: 462rpx;
  }

  .cover {
    display: flex;
    flex-direction: column;
    margin-bottom: 186rpx;
  }

  .img-invitation {
    width: 436rpx;
    height: 116rpx;
    margin-bottom: 16rpx;
  }

  .img-cover {
    width: 454rpx;
    height: 100%;
  }

  .lh15 {
    line-height: 1.5;
  }
}

.music {
  display: flex;
  align-items: center;
  margin: 60rpx 40rpx 88rpx;
  padding: 20rpx;
  box-shadow: rgb(194, 194, 194) 0 0 10rpx;
  border-radius: 10rpx;

  .music-controls {
    position: fixed;
    z-index: 99999999;
    top: 20rpx;
    right: 20rpx;
    background-color: rgba(165, 165, 165, 0.2);
    border-radius: 50%;
    border: 4rpx solid white;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    -webkit-animation: mrotate 5s linear infinite;
    animation: mrotate 5s linear infinite;
    overflow: hidden;

    &.paused {
      -webkit-animation: none;
      animation: none;

      &::after {
        content: '';
        width: 56rpx;
        height: 0;
        position: absolute;
        top: 26rpx;
        left: 0;
        border-top: 4rpx solid white;
        -webkit-transform: rotate(45deg);
        transform: rotate(45deg);
      }
    }

    & image {
      width: 40rpx;
      height: 40rpx;
    }
  }

  &-left {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &-title {
    font-size: 28rpx;
    line-height: 1;
    font-weight: bold;
    padding: 12rpx 10rpx;
  }

  &-desc {
    font-size: 24rpx;
    line-height: 1;
    font-weight: normal;
    opacity: 0.5;
    padding: 12rpx 10rpx;
  }

  &-right {
    height: 116rpx;
    display: flex;
    gap: 12rpx;
    align-items: flex-end;
  }

  &-status {
    width: 32rpx;
    height: 22rpx;
  }

  &-poster {
    width: 116rpx;
    height: 116rpx;
  }
}

.location {
  border-radius: 20rpx;
  box-shadow: rgb(153, 153, 153) 0 0 10rpx;
  padding: 20rpx;
  margin-left: 40rpx;
  margin-right: 40rpx;
  line-height: 1.5;
  font-size: 24rpx;
  position: relative;

  & > view {
    padding: 10rpx;
  }
  &-mask {
    position: absolute;
    width: 100%;
    height: 260rpx;
    top: 122rpx;
    left: -10rpx;
  }
}
</style>
