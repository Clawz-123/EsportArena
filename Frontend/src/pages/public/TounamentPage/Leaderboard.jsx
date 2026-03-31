import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
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

        <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b]/50 border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider text-center">Placement</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider text-center">Kill Pts</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider text-center">WWCD</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider text-right">Total Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm text-[#94a3b8]">Loading standings...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-red-400 text-sm">
                      Failed to load leaderboard. Please try again.
                    </td>
                  </tr>
                ) : leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => {
                    const rank = index + 1
                    const isTop3 = rank <= 3
                    const rankStyles = {
                      1: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                      2: 'bg-slate-300/10 text-slate-300 border-slate-300/20',
                      3: 'bg-amber-600/10 text-amber-600 border-amber-600/20'
                    }

                    return (
                      <tr 
                        key={entry.id} 
                        className={`group transition-all hover:bg-white/[0.02] ${isTop3 ? 'bg-white/[0.01]' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className={`
                            w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm
                            ${isTop3 ? rankStyles[rank] : 'text-[#64748b] border-transparent'}
                          `}>
                            {rank}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#1e293b] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              {entry.team_logo ? (
                                <img src={entry.team_logo} alt={entry.team_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-blue-500">
                                  {entry.team_name?.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span className={`font-semibold ${isTop3 ? 'text-white text-base' : 'text-[#e2e8f0] text-sm'}`}>
                              {entry.team_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[#94a3b8] font-medium">{entry.placement_points}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[#94a3b8] font-medium">{entry.kill_points}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`font-bold ${entry.wwcd > 0 ? 'text-[#10b981]' : 'text-[#475569]'}`}>
                              {entry.wwcd}
                            </span>
                            {entry.wwcd > 0 && <span className="text-[10px] text-[#10b981]/60 font-bold tracking-tighter">WIN</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-black tracking-tight ${isTop3 ? 'text-blue-400 text-lg' : 'text-white text-base'}`}>
                            {entry.total_points}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#64748b] text-sm italic">
                      No tournament data available for this group yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
