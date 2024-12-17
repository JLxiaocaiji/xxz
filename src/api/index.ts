import { http } from '@/utils/http'

// 获取验证码
export function getCodeImg() {
  return http({
    url: '/captchaImage',
    method: 'GET',
    timeout: 20000,
  })
}
