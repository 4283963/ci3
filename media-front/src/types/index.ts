export interface Result<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  userId: number
  username: string
  nickname: string
  avatar: string
  role: number
  token: string
  expireTime: number
}

export interface UserInfo {
  userId: number
  username: string
  nickname: string
  avatar: string
  email?: string
  phone?: string
  status: number
  role: number
}

export type PlatformType = 'douyin' | 'kuaishou' | 'xiaohongshu'

export interface PlatformAccount {
  id: number
  userId: number
  platform: PlatformType
  platformUserId: string
  platformUsername: string
  platformNickname: string
  platformAvatar: string
  accessToken?: string
  refreshToken?: string
  tokenExpireTime?: string
  scope?: string
  status: number
  createTime: string
  updateTime: string
}

export interface Video {
  id: number
  userId: number
  originalName: string
  storagePath: string
  fileUrl: string
  fileSize: number
  fileType: string
  duration: number
  coverUrl: string
  title: string
  description: string
  tags: string
  status: number
  createTime: string
  updateTime: string
}

export type TaskStatus = 0 | 1 | 2 | 3 | 4

export interface DistributeTask {
  id: number
  userId: number
  videoId: number
  accountId: number
  platform: PlatformType
  title: string
  description: string
  tags: string
  scheduleTime?: string
  status: TaskStatus
  platformVideoId?: string
  platformVideoUrl?: string
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  errorMsg?: string
  executeTime?: string
  completeTime?: string
  createTime: string
  updateTime: string
}

export interface DistributeTaskRequest {
  videoId: number
  accountIds: number[]
  title: string
  description: string
  tags: string
  scheduleTime?: string
  delay?: number
}

export interface PageParams {
  pageNum: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
}

export interface DashboardStats {
  totalVideos: number
  totalAccounts: number
  totalTasks: number
  successTasks: number
  failedTasks: number
  pendingTasks: number
  totalViews: number
  totalLikes: number
}

export interface TaskProgress {
  taskId: number
  status: number
  platform: PlatformType
  title: string
  accountId: number
  errorMsg?: string
  platformVideoId?: string
  platformVideoUrl?: string
  createTime?: string
  executeTime?: string
  completeTime?: string
  progress: number
  stats?: {
    viewCount: number
    likeCount: number
    commentCount: number
    shareCount: number
  }
}
