import { Tag, Tooltip } from 'antd'
import AnimatedNumber from './AnimatedNumber'

interface StatsTagsProps {
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  compact?: boolean
}

const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count.toLocaleString('zh-CN')
}

const StatsTags = ({
  viewCount = 0,
  likeCount = 0,
  commentCount = 0,
  shareCount = 0,
  compact = false
}: StatsTagsProps) => {
  const tags = [
    {
      key: 'view',
      icon: '👁',
      count: viewCount,
      unit: '次',
      label: '总播放量',
      color: 'blue'
    },
    {
      key: 'like',
      icon: '❤️',
      count: likeCount,
      unit: '个',
      label: '总点赞数',
      color: 'red'
    },
    {
      key: 'comment',
      icon: '💬',
      count: commentCount,
      unit: '条',
      label: '总评论数',
      color: 'orange'
    },
    {
      key: 'share',
      icon: '🔄',
      count: shareCount,
      unit: '次',
      label: '总分享数',
      color: 'green'
    }
  ]

  return (
    <span>
      {tags.map((tag) => (
        <Tooltip
          key={tag.key}
          title={`${tag.label}：${tag.count.toLocaleString('zh-CN')}${tag.unit}`}
        >
          <Tag
            color={tag.color}
            style={{
              marginRight: 8,
              marginBottom: 0,
              padding: compact ? '2px 8px' : '4px 10px',
              fontSize: compact ? 12 : 13,
              borderRadius: 10,
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <span style={{ marginRight: 4 }}>{tag.icon}</span>
            {compact ? (
              <span style={{ fontWeight: 500 }}>{formatCount(tag.count)}</span>
            ) : (
              <AnimatedNumber
                value={tag.count}
                suffix={tag.unit}
                duration={600}
              />
            )}
          </Tag>
        </Tooltip>
      ))}
    </span>
  )
}

export default StatsTags
