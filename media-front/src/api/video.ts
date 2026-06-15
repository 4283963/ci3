import { get, post, put, del, upload, request } from './request'
import type { Video, VideoWithStats, PageParams, PageResult } from '@/types'
import type { AxiosProgressEvent } from 'axios'

export const getVideoList = (params: PageParams): Promise<PageResult<Video>> => {
  return get<PageResult<Video>>('/video/list', params)
}

export const getVideoListWithStats = (): Promise<VideoWithStats[]> => {
  return get<VideoWithStats[]>('/video/list-with-stats')
}

export const getVideoById = (id: number): Promise<Video> => {
  return get<Video>(`/video/${id}`)
}

export const uploadVideo = (file: File, onProgress?: (progress: number) => void): Promise<Video> => {
  const formData = new FormData()
  formData.append('file', file)

  return request<Video>({
    url: '/video/upload',
    method: 'POST',
    data: formData,
    service: 'dist',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    }
  })
}

export const updateVideo = (id: number, data: Partial<Video>): Promise<Video> => {
  return put<Video>(`/video/${id}`, data)
}

export const deleteVideo = (id: number): Promise<void> => {
  return del<void>(`/video/${id}`)
}
