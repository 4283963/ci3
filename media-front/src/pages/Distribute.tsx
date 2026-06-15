import { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Radio,
  DatePicker,
  Space,
  Typography,
  Select,
  Modal,
  message,
  Spin,
  Tag
} from 'antd'
import { SendOutlined, VideoCameraOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { getVideoList } from '@/api/video'
import { createTask } from '@/api/task'
import AccountSelector from '@/components/AccountSelector'
import type { Video, PageResult, DistributeTaskRequest } from '@/types'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

interface DistributeForm {
  videoId: number
  accountIds: number[]
  title: string
  description: string
  tags: string
  publishType: 'now' | 'schedule'
  scheduleTime?: Dayjs
}

const Distribute = () => {
  const [form] = Form.useForm<DistributeForm>()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  const publishType = Form.useWatch('publishType', form)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const result = await getVideoList({ pageNum: 1, pageSize: 100 }) as PageResult<Video>
      setVideos(result.list.filter((v) => v.status === 1))
    } catch (error) {
      console.error('获取视频列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoChange = (videoId: number) => {
    const video = videos.find((v) => v.id === videoId)
    setSelectedVideo(video || null)
    if (video) {
      form.setFieldsValue({
        title: video.title,
        description: video.description,
        tags: video.tags
      })
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const requestData: DistributeTaskRequest = {
        videoId: values.videoId,
        accountIds: values.accountIds,
        title: values.title,
        description: values.description,
        tags: values.tags
      }

      if (values.publishType === 'schedule' && values.scheduleTime) {
        requestData.scheduleTime = values.scheduleTime.toISOString()
      }

      setSubmitting(true)
      const tasks = await createTask(requestData)
      message.success(`成功创建 ${tasks.length} 个分发任务`)
      form.resetFields()
      setSelectedVideo(null)
    } catch (error) {
      console.error('创建任务失败', error)
    } finally {
      setSubmitting(false)
    }
  }

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('minute')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        一键分发工作台
      </Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{ publishType: 'now' }}
          onFinish={handleSubmit}
        >
          <Card title="第一步：选择视频" style={{ marginBottom: 16 }}>
            <Form.Item
              name="videoId"
              label="选择要发布的视频"
              rules={[{ required: true, message: '请选择视频' }]}
            >
              <Select
                placeholder="请选择视频"
                onChange={handleVideoChange}
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {videos.map((video) => (
                  <Option key={video.id} value={video.id} label={video.title || video.originalName}>
                    <Space>
                      <VideoCameraOutlined />
                      <Text ellipsis style={{ maxWidth: 200 }}>
                        {video.title || video.originalName}
                      </Text>
                      <Tag color="blue">{formatDuration(video.duration)}</Tag>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedVideo && (
              <Card size="small" type="inner" style={{ marginTop: 16 }}>
                <Space align="start">
                  <img
                    src={selectedVideo.coverUrl || selectedVideo.fileUrl}
                    alt="cover"
                    style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Space direction="vertical" size={4} style={{ flex: 1 }}>
                    <Text strong>{selectedVideo.title || selectedVideo.originalName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      时长：{formatDuration(selectedVideo.duration)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      大小：{(selectedVideo.fileSize / 1024 / 1024).toFixed(2)} MB
                    </Text>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0 }}
                      onClick={() => setPreviewVisible(true)}
                    >
                      预览视频
                    </Button>
                  </Space>
                </Space>
              </Card>
            )}
          </Card>

          <Card title="第二步：选择分发账号" style={{ marginBottom: 16 }}>
            <Form.Item
              name="accountIds"
              label="选择要发布的平台账号（可多选）"
              rules={[{ required: true, message: '请至少选择一个账号' }]}
            >
              <AccountSelector />
            </Form.Item>
          </Card>

          <Card title="第三步：编辑发布内容" style={{ marginBottom: 16 }}>
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input placeholder="请输入视频标题" maxLength={100} showCount />
            </Form.Item>

            <Form.Item name="description" label="描述">
              <TextArea
                placeholder="请输入视频描述，介绍视频内容"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item name="tags" label="标签">
              <Input placeholder="多个标签用逗号或空格分隔，如：搞笑,美食,旅行" />
            </Form.Item>
          </Card>

          <Card title="第四步：设置发布时间" style={{ marginBottom: 24 }}>
            <Form.Item name="publishType" label="发布方式">
              <Radio.Group>
                <Radio.Button value="now">
                  <Space>
                    <SendOutlined />
                    立即发布
                  </Space>
                </Radio.Button>
                <Radio.Button value="schedule">
                  <Space>
                    <ClockCircleOutlined />
                    定时发布
                  </Space>
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            {publishType === 'schedule' && (
              <Form.Item
                name="scheduleTime"
                label="定时发布时间"
                rules={[{ required: true, message: '请选择定时发布时间' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder="选择发布时间"
                  disabledDate={disabledDate}
                  minDate={dayjs()}
                />
              </Form.Item>
            )}
          </Card>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button size="large" onClick={() => form.resetFields()}>
                重置
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
              >
                {submitting ? '创建任务中...' : '开始分发'}
              </Button>
            </Space>
          </div>
        </Form>
      )}

      <Modal
        title="视频预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {selectedVideo && (
          <video
            src={selectedVideo.fileUrl}
            controls
            style={{ width: '100%', borderRadius: 4 }}
          />
        )}
      </Modal>
    </div>
  )
}

export default Distribute
