import { useState, useEffect, useRef } from 'react'
import { Card, Button, Space, Typography, Modal, Form, Input, Popconfirm, message, Spin, Empty, Row, Col } from 'antd'
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getVideoListWithStats, deleteVideo, updateVideo } from '@/api/video'
import { recoverAllStats } from '@/api/stats'
import VideoUploader from '@/components/VideoUploader'
import StatsTags from '@/components/StatsTags'
import PlatformStatsBar from '@/components/PlatformStatsBar'
import type { VideoWithStats } from '@/types'

const { Title, Text, Paragraph } = Typography

const VideoLibrary = () => {
  const [videos, setVideos] = useState<VideoWithStats[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoWithStats | null>(null)
  const [form] = Form.useForm()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchVideos()
    startPolling()
    return () => {
      stopPolling()
    }
  }, [])

  const startPolling = () => {
    stopPolling()
    timerRef.current = setInterval(() => {
      fetchVideos(true)
    }, 30000)
  }

  const stopPolling = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const fetchVideos = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }
    try {
      const result = await getVideoListWithStats()
      setVideos(result)
    } catch (error) {
      console.error('获取视频列表失败', error)
      if (!silent) {
        message.error('获取视频列表失败')
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const handleRefreshAll = async () => {
    setRefreshing(true)
    try {
      await recoverAllStats()
      message.success('已触发全量数据刷新')
      await fetchVideos(true)
    } catch (error) {
      console.error('刷新数据失败', error)
      message.error('刷新数据失败')
    } finally {
      setRefreshing(false)
    }
  }

  const handleUploadSuccess = () => {
    fetchVideos()
  }

  const handleEdit = (video: VideoWithStats) => {
    setEditingVideo(video)
    form.setFieldsValue({
      title: video.title,
      description: video.description,
      tags: video.tags
    })
    setEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    if (!editingVideo) return

    try {
      const values = await form.validateFields()
      await updateVideo(editingVideo.id, values)
      message.success('更新成功')
      setEditModalVisible(false)
      fetchVideos()
    } catch (error) {
      console.error('更新失败', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteVideo(id)
      message.success('删除成功')
      fetchVideos()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          视频库
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefreshAll}
            loading={refreshing}
          >
            🔄 刷新数据
          </Button>
          <VideoUploader onSuccess={handleUploadSuccess} />
        </Space>
      </div>

      {loading && videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : videos.length === 0 ? (
        <Empty description="暂无视频，请先上传视频" />
      ) : (
        <Row gutter={[16, 16]}>
          {videos.map((video) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={video.id}>
              <Card
                hoverable
                loading={loading}
                bodyStyle={{ padding: 0 }}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(video)}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确定删除这个视频吗？"
                    onConfirm={() => handleDelete(video.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '56.25%',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <img
                    src={video.coverUrl || video.fileUrl}
                    alt={video.title || video.originalName}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 12
                    }}
                  >
                    {formatDuration(video.duration)}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 11
                    }}
                  >
                    {formatFileSize(video.fileSize)}
                  </div>
                </div>

                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Text strong ellipsis style={{ fontSize: 14, marginBottom: 4 }}>
                    {video.title || video.originalName}
                  </Text>
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2 }}
                    style={{ fontSize: 12, marginBottom: 12, minHeight: 32 }}
                  >
                    {video.description || '暂无描述'}
                  </Paragraph>

                  {video.stats ? (
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ marginBottom: 12 }}>
                        <StatsTags
                          viewCount={video.stats.totalView}
                          likeCount={video.stats.totalLike}
                          commentCount={video.stats.totalComment}
                          shareCount={video.stats.totalShare}
                        />
                      </div>
                      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                        <PlatformStatsBar platforms={video.stats.platforms} />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 'auto',
                        color: '#bfbfbf',
                        fontSize: 12,
                        textAlign: 'center',
                        padding: '12px 0'
                      }}
                    >
                      暂无分发数据
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#8c8c8c'
                  }}
                >
                  <span>ID: {video.id}</span>
                  <span>{dayjs(video.createTime).format('MM-DD HH:mm')}</span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="编辑视频信息"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入视频标题" maxLength={100} showCount />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入视频描述" rows={3} maxLength={500} showCount />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default VideoLibrary
