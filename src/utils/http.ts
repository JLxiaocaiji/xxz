import { useBaseConfigStore } from '@/store'

const baseConfigStore = useBaseConfigStore()

const baseUrl = 'http://localhost:8080'

type getParams = {
  params: Record<string, any>
}

const transParams = (params: Record<string, any>): string => {
  let res: string = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part: string = encodeURIComponent(propName) + '='

    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const params: string = propName + '[' + key + ']'
            const subPart: string = encodeURIComponent(params) + '='
            res = res + subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        res += part + encodeURIComponent(value) + '&'
      }
    }
  }

  return res
}

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions & getParams) {
    options.timeout = options.timeout || 10000
    options.header = {
      ...(options.header || {}),
      'source-client': 'miniapp',
    }
    const token = baseConfigStore.token
    if (token) {
      options.header.Authorization = token
    }

    // get请求映射params参数
    if (options.method == 'GET' && options.params) {
      let url = options.url + '?' + transParams(options.params)
      url = url.slice(0, -1)
      options.url = url
    }
    options.url = baseUrl + options.url
  },
}

uni.addInterceptor('request', httpInterceptor)

export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      responseType: options.responseType === undefined ? 'text' : options.responseType,
      dataType: 'json',
      method: options.method === undefined ? 'POST' : options.method,

      success: (res: Record<string, any>) => {
        if (res.data.code === 200) {
          resolve(res.data)
        } else {
          uni.showToast({
            icon: 'none',
            title: (res.data.msg || '请求错误') + '错误码为：' + res.data.code,
          })
          reject(res)
        }
      },
      fail: (err) => {
        console.error(err)
        reject(err)
      },
    })
  })
}
