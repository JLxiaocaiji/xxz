<template>
  <view class="content">
    <image class="logo" src="@/static/images/logo.jpg"></image>
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <button class="button phone" @tap="getInfo">
      <text class="icon icon-phone"></text>
      手机号快捷登录
    </button>

    <view>
      <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="logo" :src="defaultAvatarUrl"></image>
      </button>
      <input type="nickname" class="weui-input" placeholder="请输入昵称" />
    </view>

    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const defaultAvatarUrl = ref<string>(""
)
// #ifdef MP-WEIXIN
// 获取 code 登录凭证
let code = ''
const getInfo = () => {
  console.log(111)
  // uni.login({
  //   provider: 'weixin',
  //   onlyAuthorize: true,
  //   success: (logRes) => {
  //     console.log(logRes)
  //   },
  // })
  console.log(222)
  uni.getUserInfo({
    lang: 'zh_CN',
    desc: '获取用户信息',
    success: (userInfo) => {
      console.log(userInfo, 'userInfo')
      // xw.login({
      //   provider: 'weixin',
      //   success: (loginInfo) => {
      //     console.log(loginInfo, 'loginInfo')
      //   },
      // })
    },
    fail: (err) => {
      console.log(err, 'err')
    },
  })
}

const onChooseAvatar = (e) => {
  console.log(e)
  const { avatarUrl } = e.detail;
  defaultAvatarUrl.value = avatarUrl
}
// #endif
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
