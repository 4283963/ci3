import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd'
import {
  VideoCameraOutlined,
  UserOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LikeOutlined
} from '@ant-design/icons'
import { getDashboardStats } from '@/api/task'
import type { DashboardStats } from '@/types'

const { Title } = Typography

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('获取统计数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        数据概览
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="视频总数"
              value={stats?.totalVideos || 0}
              prefix={<VideoCameraOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平台账号"
              value={stats?.totalAccounts || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="分发任务"
              value={stats?.totalTasks || 0}
              prefix={<SendOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="成功发布"
              value={stats?.successTasks || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="发布失败"
              value={stats?.failedTasks || 0}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="等待发布"
              value={stats?.pendingTasks || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总播放量"
              value={stats?.totalViews || 0}
              prefix={<EyeOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总点赞数"
              value={stats?.totalLikes || 0}
              prefix={<LikeOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
