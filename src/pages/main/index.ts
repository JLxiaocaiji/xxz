import { http } from '@/utils/http'

export const getBaseInfo = () => {
  return http<Record<string, any>>({
    method: 'GET',
    url: '/getBaseInfo',
  })
}

export const getImage = () => {
  return http<string[]>({
    method: 'GET',
    url: '/getImage',
  })
}
