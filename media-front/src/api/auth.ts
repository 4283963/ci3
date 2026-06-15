import { post, get } from './request'
import type { LoginRequest, LoginResponse, UserInfo } from '@/types'

export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return post<LoginResponse>('/auth/login', data, 'auth')
}

export const logout = (): Promise<void> => {
  return post<void>('/auth/logout', undefined, 'auth')
}

export const getCurrentUser = (): Promise<UserInfo> => {
  return get<UserInfo>('/auth/user', undefined, 'auth')
}

export const refreshToken = (): Promise<{ token: string; expireTime: number }> => {
  return post<{ token: string; expireTime: number }>('/auth/refresh', undefined, 'auth')
}
