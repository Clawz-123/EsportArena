import React from 'react'

const MatchesCard = () => {
  // Mock matches data
  const matches = [
    { id: 1, team1: 'Team Phoenix', team2: 'Shadow Squad', status: 'Completed', score: '3-2' },
    { id: 2, team1: 'Elite Warriors', team2: 'Storm Riders', status: 'Upcoming', score: '-' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Tournament Matches</h2>
        <p className="text-[#9CA3AF] text-sm mb-4">
          View and manage all tournament matches
        </p>

        <div className="bg-[#1E293B] rounded-lg border border-[#2D3748] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D3748]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Match</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Team 1</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#9CA3AF] uppercase">vs</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Team 2</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-b border-[#2D3748] last:border-0 hover:bg-[#2D3748]/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">Match #{match.id}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{match.team1}</td>
                  <td className="px-6 py-4 text-sm text-[#9CA3AF] text-center">vs</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{match.team2}</td>
                  <td className="px-6 py-4 text-sm text-white">{match.score}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      match.status === 'Completed' ? 'bg-[#10B981] text-white' : 'bg-[#3B82F6] text-white'
                    }`}>
                      {match.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MatchesCard
