import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useUserStore } from '@/store/userStore'
import type { LoginRequest } from '@/types'

const { Title, Text } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setLoginInfo = useUserStore((state) => state.setLoginInfo)

  const onFinish = async (values: LoginRequest) => {
    setLoading(true)
    try {
      const result = await login(values)
      setLoginInfo(result)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      console.error('登录失败', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
        bodyStyle={{ padding: '40px 40px 24px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 8 }}>
            自媒体矩阵平台
          </Title>
          <Text type="secondary">一站式多平台视频分发管理</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', height: 44, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
