import { get, post, put, del } from './request'
import type { DistributeTask, DistributeTaskRequest, PageParams, PageResult, DashboardStats } from '@/types'

export const getTaskList = (params: PageParams): Promise<PageResult<DistributeTask>> => {
  return get<PageResult<DistributeTask>>('/task/list', params)
}

export const getTaskById = (id: number): Promise<DistributeTask> => {
  return get<DistributeTask>(`/task/${id}`)
}

export const createTask = (data: DistributeTaskRequest): Promise<DistributeTask[]> => {
  return post<DistributeTask[]>('/task/create', data)
}

export const retryTask = (id: number): Promise<DistributeTask> => {
  return post<DistributeTask>(`/task/${id}/retry`)
}

export const cancelTask = (id: number): Promise<void> => {
  return put<void>(`/task/${id}/cancel`)
}

export const deleteTask = (id: number): Promise<void> => {
  return del<void>(`/task/${id}`)
}

export const getDashboardStats = (): Promise<DashboardStats> => {
  return get<DashboardStats>('/task/stats/dashboard')
}
