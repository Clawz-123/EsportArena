import React, { useState } from 'react'
import { Trophy } from 'lucide-react'

const Leaderboard = () => {
  const [leaderboardData] = useState([
    { rank: 1, team: 'Cyber Warriors', points: 450, wins: 12, losses: 2 },
    { rank: 2, team: 'Dragon Slayers', points: 420, wins: 11, losses: 3 },
    { rank: 3, team: 'Shadow Squad', points: 390, wins: 10, losses: 4 },
    { rank: 4, team: 'Elite Force', points: 360, wins: 9, losses: 5 },
    { rank: 5, team: 'Phoenix Rising', points: 330, wins: 8, losses: 6 },
  ])

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-[#EC4899]" />
        Tournament Leaderboard
      </h3>

      <div className="overflow-x-auto rounded-lg border border-[#1F2937]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0B1220] text-[#9CA3AF] uppercase text-xs">
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">Points</th>
              <th className="px-4 py-3 text-center">Wins</th>
              <th className="px-4 py-3 text-center">Losses</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, idx) => (
              <tr key={idx} className="border-t border-[#1F2937] hover:bg-[#0B1220] transition-colors">
                <td className="px-4 py-3">
                  <span className="text-lg">{getRankIcon(entry.rank)}</span>
                </td>
                <td className="px-4 py-3 text-white">{entry.team}</td>
                <td className="px-4 py-3 text-center font-semibold text-[#EC4899]">{entry.points}</td>
                <td className="px-4 py-3 text-center text-[#10B981]">{entry.wins}</td>
                <td className="px-4 py-3 text-center text-[#EF4444]">{entry.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Leaderboard
