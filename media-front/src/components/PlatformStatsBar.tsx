import type { VideoStats } from '@/types'
import AnimatedNumber from './AnimatedNumber'

interface PlatformStatsBarProps {
  platforms: VideoStats['platforms']
}

const platformConfig: Record<string, { label: string; color: string; bgGradient: string; icon: string }> = {
  douyin: {
    label: '抖音',
    color: '#000000',
    bgGradient: 'linear-gradient(90deg, #000000 0%, #333333 100%)',
    icon: '🎵'
  },
  kuaishou: {
    label: '快手',
    color: '#ffffff',
    bgGradient: 'linear-gradient(90deg, #ff4400 0%, #ff6a00 100%)',
    icon: '📹'
  },
  xiaohongshu: {
    label: '小红书',
    color: '#ffffff',
    bgGradient: 'linear-gradient(90deg, #ff2442 0%, #ff4d6d 100%)',
    icon: '📕'
  }
}

const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count.toLocaleString('zh-CN')
}

const PlatformStatsBar = ({ platforms }: PlatformStatsBarProps) => {
  const platformList = Object.entries(platforms || {}).map(([key, value]) => ({
    key,
    ...value
  }))

  if (platformList.length === 0) {
    return (
      <div style={{ color: '#bfbfbf', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>
        暂无分发数据
      </div>
    )
  }

  const maxView = Math.max(...platformList.map((p) => p.viewCount || 0), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {platformList.map((p) => {
        const config = platformConfig[p.key] || {
          label: p.key,
          color: '#333',
          bgGradient: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
          icon: '📺'
        }
        const widthPercent = Math.max((p.viewCount || 0) / maxView * 100, p.viewCount > 0 ? 8 : 2)
        const isHot = (p.viewCount || 0) >= 100000

        return (
          <div key={p.key} style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
                fontSize: 12
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                <span>{config.icon}</span>
                <span style={{ color: '#595959' }}>{config.label}</span>
                {isHot && (
                  <span className="fire-animation" style={{ display: 'inline-block' }}>
                    🔥
                  </span>
                )}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#8c8c8c' }}>
                <span>
                  👁 <AnimatedNumber value={p.viewCount || 0} duration={500} />
                </span>
                <span>
                  ❤️ {formatCount(p.likeCount || 0)}
                </span>
              </span>
            </div>
            <div
              style={{
                height: 8,
                backgroundColor: '#f0f0f0',
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${widthPercent}%`,
                  background: config.bgGradient,
                  borderRadius: 4,
                  transition: 'width 0.6s ease-out',
                  minWidth: p.viewCount > 0 ? '8px' : '2px'
                }}
              />
            </div>
          </div>
        )
      })}
      <style>{`
        .fire-animation {
          animation: fire-shake 0.8s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes fire-shake {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          25% { transform: rotate(5deg) scale(1.1); }
          50% { transform: rotate(-3deg) scale(1.05); }
          75% { transform: rotate(3deg) scale(1.1); }
        }
      `}</style>
    </div>
  )
}

export default PlatformStatsBar
