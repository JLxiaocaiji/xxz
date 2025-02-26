import { http } from '@/utils/http'

export const getImageList = () => {
  return http<string[]>({
    method: 'GET',
    url: '/getImage',
  })
}
