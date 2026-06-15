import { useState, useEffect, useRef } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

const formatNumber = (num: number, decimals: number): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

const easeOutQuart = (t: number): number => {
  return 1 - Math.pow(1 - t, 4)
}

const AnimatedNumber = ({
  value,
  duration = 600,
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(value)
  const [colorClass, setColorClass] = useState<string>('')
  const previousValue = useRef(value)
  const rafId = useRef<number | null>(null)
  const colorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()

    if (startValue === endValue) {
      setDisplayValue(endValue)
      previousValue.current = endValue
      setColorClass('color-gray')
      if (colorTimer.current) clearTimeout(colorTimer.current)
      colorTimer.current = setTimeout(() => setColorClass(''), 300)
      return
    }

    const diff = endValue - startValue
    setColorClass(diff > 0 ? 'color-green' : 'color-red')

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutQuart(progress)
      const currentValue = startValue + diff * easedProgress

      setDisplayValue(currentValue)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = endValue
        if (colorTimer.current) clearTimeout(colorTimer.current)
        colorTimer.current = setTimeout(() => setColorClass(''), 300)
      }
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [value, duration])

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      if (colorTimer.current) clearTimeout(colorTimer.current)
    }
  }, [])

  return (
    <span className={`animated-number ${colorClass}`}>
      {prefix}
      {formatNumber(displayValue, decimals)}
      {suffix}
      <style>{`
        .animated-number {
          display: inline-flex;
          align-items: center;
          transition: color 0.3s ease;
          font-variant-numeric: tabular-nums;
        }
        .animated-number.color-green {
          color: #52c41a;
          animation: flash-green 0.3s ease;
        }
        .animated-number.color-red {
          color: #ff4d4f;
          animation: flash-red 0.3s ease;
        }
        .animated-number.color-gray {
          color: #8c8c8c;
        }
        @keyframes flash-green {
          0% { background-color: rgba(82, 196, 26, 0.2); }
          100% { background-color: transparent; }
        }
        @keyframes flash-red {
          0% { background-color: rgba(255, 77, 79, 0.2); }
          100% { background-color: transparent; }
        }
      `}</style>
    </span>
  )
}

export default AnimatedNumber
