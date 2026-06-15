import { useState, useEffect } from 'react'
import { Table, Button, Space, Typography, Tag, Avatar, Popconfirm, message, Spin } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getAccountList, deleteAccount, getOAuthUrl } from '@/api/account'
import type { PlatformAccount, PageResult, PlatformType } from '@/types'
import type { TablePaginationConfig } from 'antd/es/table'

const { Title, Text } = Typography

const platformConfig: Record<PlatformType, { label: string; color: string; bgColor: string }> = {
  douyin: { label: '抖音', color: '#000000', bgColor: '#f0f0f0' },
  kuaishou: { label: '快手', color: '#ff4400', bgColor: '#fff2e8' },
  xiaohongshu: { label: '小红书', color: '#ff2442', bgColor: '#fff0f0' }
}

const AccountManager = () => {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    fetchAccounts()
  }, [pagination.current, pagination.pageSize])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const result = await getAccountList({
        pageNum: pagination.current || 1,
        pageSize: pagination.pageSize || 10
      }) as PageResult<PlatformAccount>
      setAccounts(result.list)
      setPagination((prev) => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('获取账号列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (platform: PlatformType) => {
    try {
      const { authUrl } = await getOAuthUrl(platform)
      window.open(authUrl, '_blank')
    } catch (error) {
      console.error('获取授权链接失败', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAccount(id)
      message.success('删除成功')
      fetchAccounts()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  const columns = [
    {
      title: '账号信息',
      key: 'account',
      render: (_: unknown, record: PlatformAccount) => (
        <Space>
          <Avatar src={record.platformAvatar} size={48} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.platformNickname}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              @{record.platformUsername}
            </Text>
          </Space>
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
        return (
          <Tag color={config.bgColor} style={{ color: config.color, border: 'none' }}>
            {config.label}
          </Tag>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number, record: PlatformAccount) => {
        const isExpired = record.tokenExpireTime && dayjs(record.tokenExpireTime).isBefore(dayjs())
        
        if (status === 0) {
          return <Tag color="default">未授权</Tag>
        }
        if (isExpired) {
          return <Tag color="warning">已过期</Tag>
        }
        return <Tag color="success">已授权</Tag>
      }
    },
    {
      title: '授权有效期',
      dataIndex: 'tokenExpireTime',
      key: 'tokenExpireTime',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '绑定时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: PlatformAccount) => (
        <Space>
          <Popconfirm
            title="确定删除这个账号吗？"
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
          平台账号管理
        </Title>
        <Space>
          {(Object.keys(platformConfig) as PlatformType[]).map((platform) => (
            <Button
              key={platform}
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOAuth(platform)}
              style={{ backgroundColor: platformConfig[platform].color, borderColor: platformConfig[platform].color }}
            >
              绑定{platformConfig[platform].label}
            </Button>
          ))}
        </Space>
      </div>

      {loading && accounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          onChange={(p) => setPagination(p)}
        />
      )}
    </div>
  )
}

export default AccountManager
