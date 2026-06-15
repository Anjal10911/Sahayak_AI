import React from 'react'

/**
 * TrustMeter - signature visual element
 * A semi-circular gauge showing the agent's confidence/risk score (0-100)
 * Color-codes from leaf (clean) -> marigold (review) -> red (high risk)
 */
export default function TrustMeter({ score, verdict, loading }) {
  const angle = loading ? 0 : (score / 100) * 180
  const radius = 90
  const cx = 110
  const cy = 110

  const polarToCartesian = (centerX, centerY, r, angleDeg) => {
    const angleRad = ((angleDeg - 180) * Math.PI) / 180
    return {
      x: centerX + r * Math.cos(angleRad),
      y: centerY + r * Math.sin(angleRad),
    }
  }

  const start = polarToCartesian(cx, cy, radius, 0)
  const end = polarToCartesian(cx, cy, radius, angle)
  const largeArc = angle > 180 ? 1 : 0

  const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`

  const verdictConfig = {
    CLEAN: { color: '#2EC4B6', label: 'Looks Genuine', sublabel: 'Eligible for listing generation' },
    REVIEW: { color: '#FF9F1C', label: 'Needs a Second Look', sublabel: 'Flagged for manual review' },
    HIGH_RISK: { color: '#E63946', label: 'High Risk', sublabel: 'Listing generation blocked' },
  }

  const cfg = verdictConfig[verdict] || { color: '#9b8fc4', label: 'Awaiting Upload', sublabel: 'Upload a product photo to begin' }

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130">
        {/* background track */}
        <path
          d={`M 20 110 A 90 90 0 0 1 200 110`}
          fill="none"
          stroke="#E8E1F5"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* value arc */}
        {!loading && score !== null && (
          <path
            d={arcPath}
            fill="none"
            stroke={cfg.color}
            strokeWidth="16"
            strokeLinecap="round"
            style={{ transition: 'all 0.6s ease-out' }}
          />
        )}
        <text x="110" y="95" textAnchor="middle" fontSize="36" fontWeight="800" fill="#1B1035" fontFamily="Poppins">
          {loading ? '···' : score !== null ? score : '—'}
        </text>
        <text x="110" y="118" textAnchor="middle" fontSize="11" fill="#6B5B95" fontFamily="Inter">
          RISK SCORE
        </text>
      </svg>
      <div className="text-center mt-1">
        <div className="font-display font-bold text-lg" style={{ color: cfg.color }}>
          {loading ? 'Checking photo…' : cfg.label}
        </div>
        <div className="text-sm text-indigo-base/60 mt-0.5">{loading ? 'Running forensic checks' : cfg.sublabel}</div>
      </div>
    </div>
  )
}
