import { get, post } from './request'
import type { VideoStats } from '@/types'

export const getVideoStats = (videoId: number): Promise<VideoStats> => {
  return get<VideoStats>(`/stats/video/${videoId}`)
}

export const getVideoStatsBatch = (videoIds: number[]): Promise<Record<number, VideoStats>> => {
  return post<Record<number, VideoStats>>('/stats/video/batch', videoIds)
}

export const recoverTaskStats = (taskId: number): Promise<number> => {
  return post<number>(`/stats/recover/task/${taskId}`)
}

export const recoverTasksStatsBatch = (taskIds: number[]): Promise<number> => {
  return post<number>('/stats/recover/batch', { taskIds })
}

export const recoverAllStats = (): Promise<void> => {
  return post<void>('/stats/recover/all')
}
