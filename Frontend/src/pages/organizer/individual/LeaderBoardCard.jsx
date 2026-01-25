import React from 'react'
import { Trophy, Medal } from 'lucide-react'

const LeaderBoardCard = () => {
  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, team: 'Team Phoenix', points: 250, wins: 10, losses: 2 },
    { rank: 2, team: 'Shadow Squad', points: 230, wins: 9, losses: 3 },
    { rank: 3, team: 'Elite Warriors', points: 210, wins: 8, losses: 4 },
    { rank: 4, team: 'Storm Riders', points: 190, wins: 7, losses: 5 },
  ]

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Tournament Leaderboard</h2>
        <p className="text-[#9CA3AF] text-sm mb-4">
          Current standings and rankings
        </p>

        <div className="bg-[#1E293B] rounded-lg border border-[#2D3748] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D3748]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Points</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Wins</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Losses</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank} className="border-b border-[#2D3748] last:border-0 hover:bg-[#2D3748]/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      <span className="font-semibold">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{entry.team}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{entry.points}</td>
                  <td className="px-6 py-4 text-sm text-[#10B981]">{entry.wins}</td>
                  <td className="px-6 py-4 text-sm text-[#EF4444]">{entry.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LeaderBoardCard
