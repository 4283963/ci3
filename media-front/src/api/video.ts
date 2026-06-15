import { get, post, put, del, upload } from './request'
import type { Video, PageParams, PageResult } from '@/types'

export const getVideoList = (params: PageParams): Promise<PageResult<Video>> => {
  return get<PageResult<Video>>('/video/list', params)
}

export const getVideoById = (id: number): Promise<Video> => {
  return get<Video>(`/video/${id}`)
}

export const uploadVideo = (file: File, onProgress?: (progress: number) => void): Promise<Video> => {
  const formData = new FormData()
  formData.append('file', file)

  return upload<Video>('/video/upload', formData)
}

export const updateVideo = (id: number, data: Partial<Video>): Promise<Video> => {
  return put<Video>(`/video/${id}`, data)
}

export const deleteVideo = (id: number): Promise<void> => {
  return del<void>(`/video/${id}`)
}
