<template>
  <view>
    <!-- <view class="title">
      <view>好久不见，婚礼见丨{{ baseInfo.baseInfo.couple0 }}"&"{{ baseInfo.baseInfo.couple1 }}</view>
      <view>我们结婚啦~</view>
    </view>
    <view class="desc">
      <text class="author">{{ baseInfo.baseInfo.publisher }}</text>
      <text class="date">{{ baseInfo.baseInfo.weddingTimeStr }}</text>
    </view> -->

    <view class="cover-wrap">
      <!-- 这是我一生... -->
      <image
        class="img-cover-word"
        src="https://h5cdn.hunbei.com/editorCustomPic/2023-12-14-esxGx8bG5XNpztZMmiGWEBkTANN55ykc?imageMogr2/auto-orient/thumbnail/1156x620%3E/format/webp"
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
    </view>

    <!-- 音乐 -->
    <view class="music">
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
        <!-- 音乐封面 -->
        <image class="music-poster" :src="imgs.poster" mode="aspectFit" />
      </view>
    </view>

    <!-- 日历 -->
    <view class="calendar">
      <uni-calendar
        :selected="baseInfo.selected"
        :lunar="true"
        :showMonth="false"
        :date="baseInfo.selected[0].date"
      ></uni-calendar>
    </view>

    <!-- 地图 -->
    <view class="location mb100">
      <view>
        <view>{{ baseInfo.location.name }}</view>
        <view>{{ baseInfo.location.address }}</view>
      </view>
      // #ifdef MP-WEIXIN
      <map
        :longitude="baseInfo.location.longitude"
        :latitude="baseInfo.location.latitude"
        :enable-zoom="false"
        :enable-scroll="false"
      />
      <view class="location-mask"></view>
      <!-- 仅用于获取定位信息，获取后会打印到控制台并写入到粘贴板，正式发布时记得注释起来 -->
      <button type="primary" size="mini" @click="chooseLocation">到这里去</button>
      // #endif
    </view>

    <image v-for="(url, index) in imageList" :key="index" :src="url" mode="aspectFit"></image>
    <!-- uni.makePhoneCall -->
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, beforeMount } from 'vue'
import { getBaseInfo, getImage } from './index'

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

// 地图
const chooseLocation = () => {
  console.log(222)
  uni.openLocation({
    latitude: baseInfo.value.location.latitude, // 纬度
    longitude: baseInfo.value.location.longitude, // 经度
    name: baseInfo.value.location.name, // 地点名称（可选）
    address: baseInfo.value.location.address, // 地址（可选）
    scale: 18, // 地图缩放级别（默认18）
  })
}

// baseInfo
const baseInfo = ref<Record<string, string | number>>()
const getInfo = async () => {
  let res: any = await getBaseInfo()
  console.log(res)
  baseInfo.value = res.data.data
  console.log(baseInfo.value)
}

// 图片
const imageList = ref<string[]>()

const getImageList = async () => {
  let res: any = await getImage()
  console.log(res)
  imageList.value = res.data
  console.log(imageList.value)
}

onMounted(() => {
  // getImageList()
  getInfo()
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

.calendar {
  // padding: 20rpx;
}

// 地图
.location {
  border-radius: 20rpx;
  box-shadow: rgb(153, 153, 153) 0 0 10rpx;
  padding: 20rpx;
  margin-left: 40rpx;
  margin-right: 40rpx;
  line-height: 1.5;
  font-size: 24rpx;
  position: relative;
  display: grid;
  place-items: center;

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
  button {
    margin-top: 10rpx;
    background-color: #0077ffba;
  }
}
</style>
