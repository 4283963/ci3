import { useState, useEffect } from 'react'
import { Table, Button, Space, Typography, Modal, Form, Input, Tag, Popconfirm, message, Spin } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getVideoList, deleteVideo, updateVideo } from '@/api/video'
import VideoUploader from '@/components/VideoUploader'
import type { Video, PageResult } from '@/types'
import type { TablePaginationConfig } from 'antd/es/table'

const { Title, Text } = Typography

const VideoLibrary = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchVideos()
  }, [pagination.current, pagination.pageSize])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const result = await getVideoList({
        pageNum: pagination.current || 1,
        pageSize: pagination.pageSize || 10
      }) as PageResult<Video>
      setVideos(result.list)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('获取视频列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    fetchVideos()
  }

  const handleEdit = (video: Video) => {
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

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverUrl',
      key: 'coverUrl',
      width: 120,
      render: (coverUrl: string, record: Video) => (
        <img
          src={coverUrl || record.fileUrl}
          alt="cover"
          style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Video) => (
        <Space direction="vertical" size={0}>
          <Text strong ellipsis style={{ maxWidth: 200 }}>
            {title || record.originalName}
          </Text>
          <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 200 }}>
            {record.originalName}
          </Text>
        </Space>
      )
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => formatFileSize(size)
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration: number) => formatDuration(duration)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => {
        const statusMap: Record<number, { text: string; color: string }> = {
          0: { text: '处理中', color: 'processing' },
          1: { text: '正常', color: 'success' },
          2: { text: '失败', color: 'error' }
        }
        const s = statusMap[status] || statusMap[0]
        return <Tag color={s.color}>{s.text}</Tag>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: Video) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个视频吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          视频库
        </Title>
        <VideoUploader onSuccess={handleUploadSuccess} />
      </div>

      {loading && videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={videos}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          onChange={(p) => setPagination(p)}
          scroll={{ x: 800 }}
        />
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
