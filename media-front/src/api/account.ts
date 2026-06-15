import { get, post, del } from './request'
import type { PlatformAccount, PageParams, PageResult, PlatformType } from '@/types'

export const getAccountList = (params: PageParams): Promise<PageResult<PlatformAccount>> => {
  return get<PageResult<PlatformAccount>>('/account/list', params)
}

export const getAccountListByPlatform = (platform: PlatformType): Promise<PlatformAccount[]> => {
  return get<PlatformAccount[]>('/account/list', { platform })
}

export const getAccountById = (id: number): Promise<PlatformAccount> => {
  return get<PlatformAccount>(`/account/${id}`)
}

export const deleteAccount = (id: number): Promise<void> => {
  return del<void>(`/account/${id}`)
}

export const getOAuthUrl = (platform: PlatformType): Promise<{ authUrl: string; state: string }> => {
  return get<{ authUrl: string; state: string }>(`/account/oauth/${platform}`)
}

export const getAccountStats = (): Promise<Record<PlatformType, number>> => {
  return get<Record<PlatformType, number>>('/account/stats')
}
