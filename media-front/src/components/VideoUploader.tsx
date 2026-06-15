import { useState } from 'react'
import { Upload, Button, message, Progress } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from 'antd/es/upload/interface'
import { uploadVideo } from '@/api/video'
import type { Video } from '@/types'

interface VideoUploaderProps {
  onSuccess?: (video: Video) => void
  maxSize?: number
  accept?: string
  buttonText?: string
}

const VideoUploader = ({
  onSuccess,
  maxSize = 500,
  accept = 'video/*',
  buttonText = '上传视频'
}: VideoUploaderProps) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isVideo = file.type?.startsWith('video/')
    if (!isVideo) {
      message.error('只能上传视频文件！')
      return Upload.LIST_IGNORE
    }

    const isLtMaxSize = file.size / 1024 / 1024 < maxSize
    if (!isLtMaxSize) {
      message.error(`视频大小不能超过 ${maxSize}MB！`)
      return Upload.LIST_IGNORE
    }

    return false
  }

  const handleUploadProgress = (percent: number) => {
    setProgress(percent)
  }

  const handleUpload = async (file: UploadFile) => {
    setUploading(true)
    setProgress(0)

    try {
      const video = await uploadVideo(file as File, handleUploadProgress)
      setProgress(100)
      message.success('上传成功')
      onSuccess?.(video)
    } catch (error: any) {
      const errMsg = error?.message || '上传失败'
      message.error(`上传失败：${errMsg}`)
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 500)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept,
    showUploadList: false,
    beforeUpload,
    customRequest: ({ file }) => {
      handleUpload(file as UploadFile)
    }
  }

  return (
    <div>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} loading={uploading} disabled={uploading} type="primary">
          {uploading ? `上传中 ${progress}%` : buttonText}
        </Button>
      </Upload>
      {uploading && (
        <Progress
          percent={progress}
          style={{ marginTop: 12, width: 320 }}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068'
          }}
        />
      )}
    </div>
  )
}

export default VideoUploader
