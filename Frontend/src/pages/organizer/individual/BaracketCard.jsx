import React, { useState, useEffect } from "react"
import { Shuffle } from "lucide-react"
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentTeams, fetchTournamentDetail } from '../../../slices/tournamentSlice'
import { fetchTournamentBracket, saveTournamentBracket } from '../../../slices/BracketSlice'
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
  const bracketState = useAppSelector((state) => state.bracket)
  const [error, setError] = useState("")
  const [selectedGroup, setSelectedGroup] = useState('A')

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentTeams(tournamentId))
      dispatch(fetchTournamentDetail(tournamentId))
      dispatch(fetchTournamentBracket(tournamentId))
    }
  }, [dispatch, tournamentId])

  const canGenerate = () => {
    if (!currentTournament) return false
    const now = new Date()
    const regEnd = new Date(currentTournament.registration_end)
    return now > regEnd && (teams?.length || 0) > 0
  }

  const handleGenerateBracket = async () => {
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
    // Save bracket to backend
    try {
      await dispatch(saveTournamentBracket({ tournamentId, bracket_data: groups }))
      toast.success('Bracket saved to database!')
    } catch {
      toast.error('Failed to save bracket!')
    }
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
      {bracketState.bracket && bracketState.bracket.bracket_data ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-[#60a5fa]" />
              <h2 className="text-xl font-semibold text-white">Teams</h2>
            </div>
            <select
              className="bg-[#232c3b] text-white px-4 py-2 rounded-lg border border-[#243044] focus:outline-none"
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
            >
              {bracketState.bracket.bracket_data.map(group => (
                <option key={group.name} value={group.name}>Group {group.name}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#232c3b] rounded-xl">
              <thead>
                <tr className="text-[#94a3b8] text-left text-sm">
                  <th className="py-3 px-4 font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Team Logo</th>
                  <th className="py-3 px-4 font-medium">Team Name</th>
                  <th className="py-3 px-4 font-medium">Members</th>
                </tr>
              </thead>
              <tbody>
                {bracketState.bracket.bracket_data.find(g => g.name === selectedGroup)?.teams.map((team, idx) => (
                  <tr key={team.id || idx} className="border-b border-[#1e293b]">
                    <td className="py-2 px-4 text-white font-semibold">{idx + 1}</td>
                    <td className="py-2 px-4">
                      {team.team_logo ? (
                        <img src={team.team_logo} alt="logo" className="w-10 h-10 rounded-full object-cover bg-[#1e293b]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center text-white font-bold">
                          {team.team_name ? team.team_name.charAt(0).toUpperCase() : 'T'}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 text-white">{team.team_name || team.name || 'Team'}</td>
                    <td className="py-2 px-4 text-white">
                      {team.members && Array.isArray(team.members) ? team.members.length : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
