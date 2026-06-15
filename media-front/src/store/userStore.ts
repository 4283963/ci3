import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo, LoginResponse } from '@/types'

interface UserState {
  userInfo: UserInfo | null
  token: string | null
  expireTime: number | null
  setLoginInfo: (data: LoginResponse) => void
  setUserInfo: (userInfo: UserInfo) => void
  clearUserInfo: () => void
  isLoggedIn: () => boolean
  isTokenExpired: () => boolean
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userInfo: null,
      token: null,
      expireTime: null,

      setLoginInfo: (data: LoginResponse) => {
        set({
          userInfo: {
            userId: data.userId,
            username: data.username,
            nickname: data.nickname,
            avatar: data.avatar,
            role: data.role,
            status: 1
          },
          token: data.token,
          expireTime: data.expireTime
        })
      },

      setUserInfo: (userInfo: UserInfo) => {
        set({ userInfo })
      },

      clearUserInfo: () => {
        set({
          userInfo: null,
          token: null,
          expireTime: null
        })
      },

      isLoggedIn: () => {
        const { token, expireTime } = get()
        return !!token && !!(expireTime && expireTime > Date.now())
      },

      isTokenExpired: () => {
        const { expireTime } = get()
        return !expireTime || expireTime <= Date.now()
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        userInfo: state.userInfo,
        token: state.token,
        expireTime: state.expireTime
      })
    }
  )
)
