import React, { useState, useEffect } from "react"
import { Shuffle } from "lucide-react"
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentTeams, fetchTournamentDetail } from '../../../slices/tournamentSlice'
import { toast } from 'react-toastify'

function shuffleArray(array) {
  // Fisher-Yates shuffle
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const BracketCard = ({ tournamentId }) => {
  const dispatch = useAppDispatch()
  const { teams, teamsLoading, currentTournament } = useAppSelector((state) => state.tournament)
  const [bracket, setBracket] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentTeams(tournamentId))
      dispatch(fetchTournamentDetail(tournamentId))
    }
  }, [dispatch, tournamentId])

  const canGenerate = () => {
    if (!currentTournament) return false
    const now = new Date()
    const regEnd = new Date(currentTournament.registration_end)
    return now > regEnd && (teams?.length || 0) > 0
  }

  const handleGenerateBracket = () => {
    setError("")
    if (!currentTournament) return
    const now = new Date()
    const regEnd = new Date(currentTournament.registration_end)
    if (now <= regEnd) {
      console.log('Brackets can only be generated after registration ends')
      toast.error('Brackets can only be generated after registration ends', { toastId: 'bracket-reg-end' })
      return
    }
    if (!canGenerate()) {
      setError("Bracket can only be generated after registration ends and teams are available.")
      return
    }
    const shuffled = shuffleArray(teams)
    let groups = []
    if (shuffled.length > 16) {
      // Split into groups of up to 16
      const groupCount = Math.ceil(shuffled.length / 16)
      for (let i = 0; i < groupCount; i++) {
        groups.push({
          name: String.fromCharCode(65 + i), // 'A', 'B', ...
          teams: shuffled.slice(i * 16, (i + 1) * 16),
        })
      }
    } else {
      groups = [{ name: 'A', teams: shuffled }]
    }
    setBracket(groups)
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#1e293b] border border-[#243044] rounded-2xl p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-16">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-[#cbd5e1]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h1 className="text-lg font-semibold text-white">
              Tournament Bracket
            </h1>
          </div>
          <p className="text-sm text-[#94a3b8]">
            Generate and manage tournament bracket
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition cursor-pointer"
          onClick={handleGenerateBracket}
          disabled={teamsLoading}
        >
          <Shuffle className="w-4 h-4" />
          Generate Bracket
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-center mb-4">{error}</div>
      )}

      {/* Bracket Display */}
      {bracket ? (
        <div className="flex flex-wrap gap-8 justify-center">
          {bracket.map((group) => (
            <div key={group.name} className="bg-[#232c3b] rounded-xl p-6 min-w-[260px] max-w-xs w-full">
              <h2 className="text-lg font-bold text-[#60a5fa] mb-3">Group {group.name}</h2>
              <ul className="space-y-2">
                {group.teams.map((team, idx) => (
                  <li key={team.id || idx} className="bg-[#1e293b] rounded px-3 py-2 text-white text-sm font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    {team.team_name || team.name || 'Team'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Shuffle className="w-14 h-14 text-[#64748b] mb-6" />
          <h2 className="text-xl font-semibold text-[#cbd5e1] mb-2">
            No Bracket Generated
          </h2>
          <p className="text-sm text-[#94a3b8]">
            Click "Generate Bracket" to create the tournament bracket
          </p>
        </div>
      )}
    </div>
  )
}

export default BracketCard
