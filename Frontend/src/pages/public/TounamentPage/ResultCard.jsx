import React, { useState } from 'react'
import { Target } from 'lucide-react'

const ResultCard = () => {
  const [results] = useState([
    { id: 1, team1: 'Cyber Warriors', team2: 'Dragon Slayers', score1: 2, score2: 1, date: '12/20/2025', status: 'Completed' },
    { id: 2, team1: 'Shadow Squad', team2: 'Elite Force', score1: 3, score2: 0, date: '12/21/2025', status: 'Completed' },
    { id: 3, team1: 'Phoenix Rising', team2: 'Cyber Warriors', score1: 1, score2: 2, date: '12/22/2025', status: 'Completed' },
  ])

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-[#2563EB]" />
        Match Results
      </h3>

      <div className="space-y-3">
        {results.length > 0 ? (
          results.map((result) => (
            <div key={result.id} className="border border-[#1F2937] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#6B7280]">{result.date}</span>
                <span className="text-xs font-semibold text-[#10B981] bg-[#0B1220] px-2 py-1 rounded">
                  {result.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-right">
                  <p className="text-white font-medium">{result.team1}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#2563EB]">
                    {result.score1} - {result.score2}
                  </p>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{result.team2}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[#6B7280] text-sm text-center py-8">No results available yet.</p>
        )}
      </div>
    </div>
  )
}

export default ResultCard
