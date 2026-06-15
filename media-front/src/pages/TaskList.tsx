import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Select,
  Popconfirm,
  message,
  Spin,
  Descriptions,
  Modal
} from 'antd'
import {
  ReloadOutlined,
  DeleteOutlined,
  RetweetOutlined,
  StopOutlined,
  EyeOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getTaskList, deleteTask, retryTask, cancelTask } from '@/api/task'
import type { DistributeTask, PageResult, TaskStatus, PlatformType } from '@/types'
import type { TablePaginationConfig } from 'antd/es/table'

const { Title, Text } = Typography
const { Option } = Select

const platformConfig: Record<PlatformType, { label: string; color: string }> = {
  douyin: { label: '抖音', color: '#000000' },
  kuaishou: { label: '快手', color: '#ff4400' },
  xiaohongshu: { label: '小红书', color: '#ff2442' }
}

const statusConfig: Record<TaskStatus, { text: string; color: string }> = {
  0: { text: '待处理', color: 'default' },
  1: { text: '处理中', color: 'processing' },
  2: { text: '已完成', color: 'success' },
  3: { text: '已失败', color: 'error' },
  4: { text: '已取消', color: 'warning' }
}

const TaskList = () => {
  const [tasks, setTasks] = useState<DistributeTask[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null)
  const [platformFilter, setPlatformFilter] = useState<PlatformType | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<DistributeTask | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [pagination.current, pagination.pageSize, statusFilter, platformFilter])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {
        pageNum: pagination.current || 1,
        pageSize: pagination.pageSize || 10
      }
      if (statusFilter !== null) {
        params.status = statusFilter
      }
      if (platformFilter) {
        params.platform = platformFilter
      }

      const result = await getTaskList(params as { pageNum: number; pageSize: number }) as PageResult<DistributeTask>
      setTasks(result.list)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('获取任务列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async (id: number) => {
    try {
      await retryTask(id)
      message.success('重试成功')
      fetchTasks()
    } catch (error) {
      console.error('重试失败', error)
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await cancelTask(id)
      message.success('取消成功')
      fetchTasks()
    } catch (error) {
      console.error('取消失败', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id)
      message.success('删除成功')
      fetchTasks()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  const handleViewDetail = (task: DistributeTask) => {
    setSelectedTask(task)
    setDetailVisible(true)
  }

  const canRetry = (status: TaskStatus) => status === 3
  const canCancel = (status: TaskStatus) => status === 0 || status === 1

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: DistributeTask) => (
        <Space direction="vertical" size={0}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description || '无描述'}
          </Text>
        </Space>
      )
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (platform: PlatformType) => {
        const config = platformConfig[platform]
        return <Tag color={config.bgColor} style={{ color: config.color, border: 'none' }}>
          {config.label}
        </Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TaskStatus) => {
        const config = statusConfig[status]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '数据统计',
      key: 'stats',
      width: 160,
      render: (_: unknown, record: DistributeTask) => (
        <Space size={8}>
          <span>👁 {record.viewCount || 0}</span>
          <span>👍 {record.likeCount || 0}</span>
          <span>💬 {record.commentCount || 0}</span>
        </Space>
      )
    },
    {
      title: '定时发布',
      dataIndex: 'scheduleTime',
      key: 'scheduleTime',
      width: 160,
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '立即发布')
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
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: DistributeTask) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {canRetry(record.status) && (
            <Button
              type="link"
              size="small"
              icon={<RetweetOutlined />}
              onClick={() => handleRetry(record.id)}
            >
              重试
            </Button>
          )}
          {canCancel(record.status) && (
            <Popconfirm
              title="确定取消这个任务吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" icon={<StopOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定删除这个任务吗？"
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          任务列表
        </Title>
        <Space>
          <Select
            placeholder="筛选状态"
            style={{ width: 120 }}
            allowClear
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          >
            {(Object.keys(statusConfig) as unknown as TaskStatus[]).map((status) => (
              <Option key={status} value={status}>
                {statusConfig[status].text}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="筛选平台"
            style={{ width: 120 }}
            allowClear
            value={platformFilter}
            onChange={(value) => setPlatformFilter(value)}
          >
            {(Object.keys(platformConfig) as PlatformType[]).map((platform) => (
              <Option key={platform} value={platform}>
                {platformConfig[platform].label}
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchTasks}>
            刷新
          </Button>
        </Space>
      </div>

      {loading && tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          onChange={(p) => setPagination(p)}
          scroll={{ x: 1100 }}
        />
      )}

      <Modal
        title="任务详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTask && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="任务ID">{selectedTask.id}</Descriptions.Item>
            <Descriptions.Item label="平台">
              <Tag color={platformConfig[selectedTask.platform].bgColor} style={{ color: platformConfig[selectedTask.platform].color }}>
                {platformConfig[selectedTask.platform].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusConfig[selectedTask.status].color}>
                {statusConfig[selectedTask.status].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="视频ID">{selectedTask.videoId}</Descriptions.Item>
            <Descriptions.Item label="标题" span={2}>
              {selectedTask.title}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {selectedTask.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="标签" span={2}>
              {selectedTask.tags || '-'}
            </Descriptions.Item>
            {selectedTask.platformVideoUrl && (
              <Descriptions.Item label="发布链接" span={2}>
                <a href={selectedTask.platformVideoUrl} target="_blank" rel="noreferrer">
                  {selectedTask.platformVideoUrl}
                </a>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="播放量">{selectedTask.viewCount || 0}</Descriptions.Item>
            <Descriptions.Item label="点赞数">{selectedTask.likeCount || 0}</Descriptions.Item>
            <Descriptions.Item label="评论数">{selectedTask.commentCount || 0}</Descriptions.Item>
            <Descriptions.Item label="分享数">{selectedTask.shareCount || 0}</Descriptions.Item>
            <Descriptions.Item label="定时发布">
              {selectedTask.scheduleTime ? dayjs(selectedTask.scheduleTime).format('YYYY-MM-DD HH:mm') : '立即发布'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(selectedTask.createTime).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            {selectedTask.executeTime && (
              <Descriptions.Item label="执行时间">
                {dayjs(selectedTask.executeTime).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            )}
            {selectedTask.completeTime && (
              <Descriptions.Item label="完成时间">
                {dayjs(selectedTask.completeTime).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            )}
            {selectedTask.errorMsg && (
              <Descriptions.Item label="错误信息" span={2}>
                <Text type="danger">{selectedTask.errorMsg}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default TaskList
