import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { useUserStore } from '@/store/userStore'
import type { Result } from '@/types'

const AUTH_BASE = import.meta.env.VITE_API_AUTH_BASE || '/api/auth'
const DIST_BASE = import.meta.env.VITE_API_DIST_BASE || '/api/dist'

enum ResultCode {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  SERVER_ERROR = 500
}

interface RequestConfig extends AxiosRequestConfig {
  service?: 'auth' | 'dist'
  onUploadProgress?: (progressEvent: any) => void
}

const createInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30 * 60 * 1000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { token, isTokenExpired } = useUserStore.getState()
      
      if (token && !isTokenExpired()) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    (response: AxiosResponse<Result>) => {
      const { code, message: msg, data } = response.data

      if (code === ResultCode.SUCCESS) {
        return data as unknown as AxiosResponse
      }

      if (code === ResultCode.UNAUTHORIZED) {
        useUserStore.getState().clearUserInfo()
        message.error('登录已过期，请重新登录')
        window.location.href = '/login'
        return Promise.reject(new Error(msg || '未授权'))
      }

      if (code === ResultCode.FORBIDDEN) {
        message.error('没有权限访问')
        return Promise.reject(new Error(msg || '没有权限'))
      }

      message.error(msg || '请求失败')
      return Promise.reject(new Error(msg || '请求失败'))
    },
    (error) => {
      if (error.response) {
        const { status } = error.response
        
        if (status === ResultCode.UNAUTHORIZED) {
          useUserStore.getState().clearUserInfo()
          message.error('登录已过期，请重新登录')
          window.location.href = '/login'
        } else if (status === ResultCode.FORBIDDEN) {
          message.error('没有权限访问')
        } else if (status === ResultCode.SERVER_ERROR) {
          message.error('服务器错误')
        } else {
          message.error(error.message || '网络错误')
        }
      } else {
        message.error('网络连接失败，请检查网络')
      }

      return Promise.reject(error)
    }
  )

  return instance
}

const authInstance = createInstance(AUTH_BASE)
const distInstance = createInstance(DIST_BASE)

export const request = <T>(config: RequestConfig): Promise<T> => {
  const { service = 'dist', ...restConfig } = config
  const instance = service === 'auth' ? authInstance : distInstance
  return instance.request<unknown, T>(restConfig)
}

export const get = <T>(url: string, params?: object, service: 'auth' | 'dist' = 'dist'): Promise<T> => {
  return request<T>({ url, method: 'GET', params, service })
}

export const post = <T>(url: string, data?: object, service: 'auth' | 'dist' = 'dist'): Promise<T> => {
  return request<T>({ url, method: 'POST', data, service })
}

export const put = <T>(url: string, data?: object, service: 'auth' | 'dist' = 'dist'): Promise<T> => {
  return request<T>({ url, method: 'PUT', data, service })
}

export const del = <T>(url: string, params?: object, service: 'auth' | 'dist' = 'dist'): Promise<T> => {
  return request<T>({ url, method: 'DELETE', params, service })
}

export const upload = <T>(url: string, data: FormData, service: 'auth' | 'dist' = 'dist'): Promise<T> => {
  return request<T>({
    url,
    method: 'POST',
    data,
    service,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
