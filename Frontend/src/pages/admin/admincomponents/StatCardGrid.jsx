import React from 'react'
import { ArrowUpRight } from 'lucide-react'

const StatCard = ({ label, value, sublabel, icon: Icon, iconColor, iconBg, action }) => (
  <div
    onClick={action}
    className={`bg-[#111827] border border-[#1F2937] rounded-xl p-5 transition-all ${
      action ? 'cursor-pointer hover:border-[#374151]' : ''
    }`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-lg ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />
      </div>
      {action && <ArrowUpRight className="w-4 h-4 text-[#6B7280]" />}
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <p className="text-xs text-[#6B7280] font-medium">{label}</p>
    {sublabel && <p className="text-[11px] text-[#4B5563] mt-1">{sublabel}</p>}
  </div>
)

const StatCardGrid = ({ cards }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {cards.map((card, idx) => (
      <StatCard key={idx} {...card} />
    ))}
  </div>
)

export default StatCardGrid
