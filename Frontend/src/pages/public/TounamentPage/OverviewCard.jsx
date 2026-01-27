import React from 'react'
import { Trophy, Medal } from 'lucide-react'

const OverviewCard = ({ tournament }) => {

  const prizes = [
    { amount: tournament.prize_first, rank: '1st' },
    { amount: tournament.prize_second, rank: '2nd' },
    { amount: tournament.prize_third, rank: '3rd' },
  ].filter((p) => p.amount > 0)

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Tournament Rules */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tournament Rules</h3>
        <ol className="space-y-3">
          {tournament.match_rules ? (
            tournament.match_rules.split('\n').map((rule, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-[#2563EB] font-semibold shrink-0">{idx + 1}</span>
                <span className="text-[#9CA3AF] text-sm leading-relaxed">{rule.trim()}</span>
              </li>
            ))
          ) : (
            <li className="text-[#6B7280] text-sm">No rules specified</li>
          )}
        </ol>
      </div>

      {/* Prize Distribution */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Prize Distribution</h3>
        <div className="space-y-3">
          {prizes.length > 0 ? (
            prizes.map((prize, idx) => {
              const ranks = ['1st', '2nd', '3rd', '4th']
              const rank = ranks[idx]
              const icons = [Trophy, Medal, Medal, Medal]
              const Icon = icons[idx]
              return (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[#1F2937]">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#2563EB]" />
                    <span className="text-[#E5E7EB] text-sm">{rank} Place</span>
                  </div>
                  <span className="text-[#EC4899] font-semibold">{prize.amount.toLocaleString()} Coins</span>
                </div>
              )
            })
          ) : (
            <p className="text-[#6B7280] text-sm">No prize distribution available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default OverviewCard
