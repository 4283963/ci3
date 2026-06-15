import { useState, useEffect } from 'react'
import { Checkbox, Card, Avatar, Space, Typography, Empty } from 'antd'
import type { CheckboxProps } from 'antd'
import { getAccountList } from '@/api/account'
import type { PlatformAccount, PlatformType, PageResult } from '@/types'

const { Text, Paragraph } = Typography

interface AccountSelectorProps {
  value?: number[]
  onChange?: (value: number[]) => void
  disabled?: boolean
}

const platformConfig: Record<PlatformType, { label: string; color: string }> = {
  douyin: { label: '抖音', color: '#000000' },
  kuaishou: { label: '快手', color: '#ff4400' },
  xiaohongshu: { label: '小红书', color: '#ff2442' }
}

const AccountSelector = ({ value = [], onChange, disabled }: AccountSelectorProps) => {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const result = await getAccountList({ pageNum: 1, pageSize: 100 }) as PageResult<PlatformAccount>
      setAccounts(result.list.filter((acc) => acc.status === 1))
    } catch (error) {
      console.error('获取账号列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.platform]) {
      acc[account.platform] = []
    }
    acc[account.platform].push(account)
    return acc
  }, {} as Record<PlatformType, PlatformAccount[]>)

  const handleCheckAll = (platform: PlatformType, checked: boolean) => {
    const platformAccounts = groupedAccounts[platform] || []
    const platformIds = platformAccounts.map((acc) => acc.id)

    let newValue: number[]
    if (checked) {
      newValue = Array.from(new Set([...value, ...platformIds]))
    } else {
      newValue = value.filter((id) => !platformIds.includes(id))
    }

    onChange?.(newValue)
  }

  const handleCheckItem = (id: number, checked: boolean) => {
    let newValue: number[]
    if (checked) {
      newValue = [...value, id]
    } else {
      newValue = value.filter((v) => v !== id)
    }
    onChange?.(newValue)
  }

  const isPlatformAllChecked = (platform: PlatformType) => {
    const platformAccounts = groupedAccounts[platform] || []
    if (platformAccounts.length === 0) return false
    return platformAccounts.every((acc) => value.includes(acc.id))
  }

  const isPlatformIndeterminate = (platform: PlatformType) => {
    const platformAccounts = groupedAccounts[platform] || []
    const checkedCount = platformAccounts.filter((acc) => value.includes(acc.id)).length
    return checkedCount > 0 && checkedCount < platformAccounts.length
  }

  if (accounts.length === 0 && !loading) {
    return <Empty description="暂无可用账号，请先在账号管理中添加平台账号" />
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {(Object.keys(groupedAccounts) as PlatformType[]).map((platform) => (
        <div key={platform}>
          <Checkbox
            checked={isPlatformAllChecked(platform)}
            indeterminate={isPlatformIndeterminate(platform)}
            onChange={(e: CheckboxProps['onChange']) => handleCheckAll(platform, e?.target.checked ?? false)}
            disabled={disabled}
            style={{ marginBottom: 12, fontWeight: 500 }}
          >
            <span style={{ color: platformConfig[platform].color }}>
              {platformConfig[platform].label}
            </span>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              ({groupedAccounts[platform].length}个账号)
            </Text>
          </Checkbox>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {groupedAccounts[platform].map((account) => (
              <Card
                key={account.id}
                size="small"
                style={{
                  borderColor: value.includes(account.id) ? platformConfig[platform].color : undefined,
                  opacity: disabled && !value.includes(account.id) ? 0.5 : 1
                }}
                bodyStyle={{ padding: 12 }}
              >
                <Space style={{ width: '100%' }}>
                  <Checkbox
                    checked={value.includes(account.id)}
                    onChange={(e) => handleCheckItem(account.id, e.target.checked)}
                    disabled={disabled}
                  />
                  <Avatar src={account.platformAvatar} size={40} />
                  <Space direction="vertical" size={0} style={{ flex: 1, minWidth: 0 }}>
                    <Text strong ellipsis>
                      {account.platformNickname}
                    </Text>
                    <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                      @{account.platformUsername}
                    </Text>
                  </Space>
                </Space>
                {account.platform && (
                  <Paragraph
                    type="secondary"
                    style={{
                      margin: '8px 0 0 32px',
                      fontSize: 12,
                      color: platformConfig[platform].color
                    }}
                  >
                    {platformConfig[platform].label}
                  </Paragraph>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </Space>
  )
}

export default AccountSelector
