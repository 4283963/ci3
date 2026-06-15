import { useState } from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Space, Typography } from 'antd'
import {
  DashboardOutlined,
  VideoCameraOutlined,
  UserOutlined,
  SendOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store/userStore'
import { logout } from '@/api/auth'

const { Header, Sider, Content } = AntLayout
const { Text } = Typography

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, clearUserInfo } = useUserStore()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败', error)
    } finally {
      clearUserInfo()
      navigate('/login')
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据概览'
    },
    {
      key: '/videos',
      icon: <VideoCameraOutlined />,
      label: '视频库'
    },
    {
      key: '/accounts',
      icon: <UserOutlined />,
      label: '账号管理'
    },
    {
      key: '/distribute',
      icon: <SendOutlined />,
      label: '一键分发'
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: '任务列表'
    }
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: '#001529'
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 18 : 20,
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.1)'
          }}
        >
          {collapsed ? '矩阵' : '自媒体矩阵'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
          }}
        >
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, cursor: 'pointer', width: 64 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={userInfo?.avatar} icon={<UserOutlined />} />
              <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                <Text strong style={{ fontSize: 14 }}>
                  {userInfo?.nickname || userInfo?.username}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {userInfo?.role === 1 ? '管理员' : '普通用户'}
                </Text>
              </Space>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)'
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
