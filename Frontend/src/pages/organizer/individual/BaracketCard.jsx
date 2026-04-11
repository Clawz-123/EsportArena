import React, { useState, useEffect } from "react"
import { Shuffle } from "lucide-react"
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentTeams, fetchTournamentDetail } from '../../../slices/tournamentSlice'
import { fetchTournamentBracket, saveTournamentBracket } from '../../../slices/BracketSlice'
import { toast } from 'react-toastify'

function shuffleArray(array) {
  // Creates a shuffled copy of the input array using the Fisher-Yates algorithm to ensure randomness
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
  const [showGroupSizeModal, setShowGroupSizeModal] = useState(false)
  const [groupSize, setGroupSize] = useState('16')

  const groupSizeOptions = [1, 2, 4, 8, 16, 32]

  const hasBracket = Boolean(bracketState.bracket && bracketState.bracket.bracket_data)

  const canGenerateByStatus = () => {
    const normalizedStatus = String(currentTournament?.status || '').toLowerCase()
    return normalizedStatus === 'registration closed' || normalizedStatus === 'active'
  }

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentTeams(tournamentId))
      dispatch(fetchTournamentDetail(tournamentId))
      dispatch(fetchTournamentBracket(tournamentId))
    }
  }, [dispatch, tournamentId])

  const canGenerate = () => {
    if (!currentTournament) return false
    if (hasBracket) return false
    return canGenerateByStatus() && (teams?.length || 0) > 0
  }

  const validateGenerationGate = () => {
    setError("")
    if (!currentTournament) return false

    if (hasBracket) {
      toast.info('Bracket already generated for this tournament.', { toastId: 'bracket-generated-once' })
      return false
    }

    if (!canGenerateByStatus()) {
      toast.error('Brackets can only be generated when tournament is registration closed or ongoing.', { toastId: 'bracket-status-gate' })
      return false
    }

    if (!canGenerate()) {
      setError("Bracket can only be generated when status is eligible and teams are available.")
      return false
    }

    return true
  }

  const handleOpenGroupSizeModal = () => {
    if (!validateGenerationGate()) return
    setShowGroupSizeModal(true)
  }

  const handleGenerateBracket = async (selectedGroupSize) => {
    if (!validateGenerationGate()) return

    const teamsPerGroup = Number(selectedGroupSize)
    if (!Number.isInteger(teamsPerGroup) || teamsPerGroup < 1) {
      toast.error('Please select a valid group size.')
      return
    }

    const shuffled = shuffleArray(teams)

    const groups = []
    const groupCount = Math.ceil(shuffled.length / teamsPerGroup)
    for (let i = 0; i < groupCount; i++) {
      groups.push({
        name: String.fromCharCode(65 + i),
        teams: shuffled.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup),
      })
    }

    // Save bracket to backend
    try {
      const result = await dispatch(saveTournamentBracket({ tournamentId, bracket_data: groups }))
      if (saveTournamentBracket.fulfilled.match(result)) {
        setShowGroupSizeModal(false)
        toast.success('Bracket saved to database!')
      } else {
        const errorMessage =
          result.payload?.detail ||
          result.payload?.Error_Message ||
          result.payload?.error_message ||
          result.payload?.message ||
          'Failed to save bracket!'
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to save bracket!')
      }
    } catch {
      toast.error('Failed to save bracket!')
    }
  }

  const handleConfirmGenerateBracket = () => {
    handleGenerateBracket(groupSize)
  }

  const estimatedGroupCount = Math.max(
    1,
    Math.ceil((teams?.length || 0) / Math.max(1, Number(groupSize) || 1))
  )

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
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleOpenGroupSizeModal}
          disabled={teamsLoading || hasBracket}
        >
          <Shuffle className="w-4 h-4" />
          {hasBracket ? 'Bracket Generated' : 'Generate Bracket'}
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

      {showGroupSizeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Select Group Size</h3>
            <p className="text-sm text-[#9CA3AF] mb-4">
              Choose how many teams should be placed in each generated group.
            </p>

            <label className="block text-sm text-[#E5E7EB] mb-2">Teams Per Group</label>
            <select
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#243044] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6]"
            >
              {groupSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <p className="text-xs text-[#94A3B8] mt-3">
              Total teams: {teams?.length || 0} | Estimated groups: {estimatedGroupCount}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGroupSizeModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#2D3748] text-[#E5E7EB] text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmGenerateBracket}
                className="px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BracketCard
