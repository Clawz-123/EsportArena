import React, { useEffect, useMemo, useState } from 'react'
import { Trophy, ChevronDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentBracket } from '../../../slices/BracketSlice'
import { fetchLeaderboardEntries } from '../../../slices/leaderBoardSlice'

const Leaderboard = ({ tournament }) => {
  const dispatch = useAppDispatch()
  const { bracket } = useAppSelector((state) => state.bracket)
  const { entries, loading, error } = useAppSelector((state) => state.leaderboard || {})
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')

  const tournamentId = tournament?.id

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentBracket(tournamentId))
    }
  }, [dispatch, tournamentId])

  useEffect(() => {
    if (bracket && bracket.bracket_data) {
      let extractedGroups = []

      if (Array.isArray(bracket.bracket_data)) {
        extractedGroups = bracket.bracket_data.map((g) => g.name ?? g).filter(Boolean)
      } else if (bracket.bracket_data.groups && Array.isArray(bracket.bracket_data.groups)) {
        extractedGroups = bracket.bracket_data.groups.map((g) => g.name ?? g).filter(Boolean)
      }

      if (JSON.stringify(groups) !== JSON.stringify(extractedGroups)) {
        setGroups(extractedGroups)
        setSelectedGroup(extractedGroups.length > 0 ? extractedGroups[0] : '')
      }
    }
  }, [bracket, groups])

  useEffect(() => {
    if (tournamentId && selectedGroup) {
      dispatch(
        fetchLeaderboardEntries({
          tournamentId,
          bracketId: bracket?.id,
          groupName: selectedGroup,
        })
      )
    }
  }, [dispatch, tournamentId, bracket?.id, selectedGroup])

  const leaderboard = useMemo(() => {
    const data = Array.isArray(entries) ? [...entries] : []
    data.sort((a, b) => {
      const totalA = Number(a.total_points || 0)
      const totalB = Number(b.total_points || 0)
      if (totalB !== totalA) return totalB - totalA
      const killsA = Number(a.kill_points || 0)
      const killsB = Number(b.kill_points || 0)
      if (killsB !== killsA) return killsB - killsA
      return Number(b.placement_points || 0) - Number(a.placement_points || 0)
    })
    return data
  }, [entries])

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Group Leaderboard</h2>
            <p className="text-[#9CA3AF] text-sm">
              Current standings and rankings
            </p>
          </div>
          <div className="relative">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="appearance-none bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer min-w-40"
            >
              {groups.length === 0 && <option value="">No groups</option>}
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg border border-[#2D3748] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D3748]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Team</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Points</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Kills</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">WWCD</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">Loading leaderboard...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className="text-sm text-red-400">Failed to load leaderboard.</p>
                  </td>
                </tr>
              ) : leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <tr key={entry.id} className="border-b border-[#2D3748] last:border-0 hover:bg-[#2D3748]/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{entry.team_name}</td>
                    <td className="px-6 py-4 text-sm text-white font-semibold">{entry.placement_points}</td>
                    <td className="px-6 py-4 text-sm text-white">{entry.kill_points}</td>
                    <td className="px-6 py-4 text-sm text-[#10B981]">{entry.wwcd}</td>
                    <td className="px-6 py-4 text-sm text-white font-semibold">{entry.total_points}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">No leaderboard data yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
