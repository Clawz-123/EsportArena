/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useState } from 'react'
import { Trophy, Medal, ChevronDown, Pencil } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentBracket } from '../../../slices/BracketSlice'
import { fetchLeaderboardEntries, updateLeaderboardEntry } from '../../../slices/leaderBoardSlice'
import { fetchMatchesByTournament } from '../../../slices/MatchSlice'

const LeaderBoardCard = ({ tournamentId }) => {
  const dispatch = useAppDispatch()
  const { bracket } = useAppSelector((state) => state.bracket)
  const { entries, loading, error, updateLoading } = useAppSelector((state) => state.leaderboard || {})
  const { matches = [] } = useAppSelector((state) => state.match || {})
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [editForm, setEditForm] = useState({
    match_id: '',
    placement_points: '',
    kill_points: '',
    wwcd: '',
  })

  // Fetching bracket data when tournamentId changes to populate group options
  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentBracket(tournamentId))
      dispatch(fetchMatchesByTournament(tournamentId))
    }
  }, [dispatch, tournamentId])

  // Extracting group names from bracket data and setting the first group as selected by default
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

  // Fetching leaderboard entries whenever the selected group changes to update the displayed standings
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

  // Memoizing the sorted leaderboard entries based on total points, kill points, and placement points for efficient re-rendering
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

  const groupMatches = useMemo(() => {
    return (matches || [])
      .filter((match) => {
        if (!selectedGroup) return false
        const sameGroup = String(match.group || '').trim().toLowerCase() === String(selectedGroup || '').trim().toLowerCase()
        const isCompleted = String(match.status || '').trim().toLowerCase() === 'completed'
        return sameGroup && isCompleted
      })
      .sort((a, b) => Number(a.match_number || 0) - Number(b.match_number || 0))
  }, [matches, selectedGroup])

  const openEditPoints = (entry) => {
    if (groupMatches.length === 0) {
      toast.info('Complete at least one match in this group before updating leaderboard points.')
      return
    }

    setEditingEntry(entry)
    setEditForm({
      match_id: String(groupMatches[0]?.id || ''),
      placement_points: String(entry.placement_points ?? ''),
      kill_points: String(entry.kill_points ?? ''),
      wwcd: String(entry.wwcd ?? ''),
    })
  }

  const closeEditPoints = () => {
    setEditingEntry(null)
    setEditForm({ match_id: '', placement_points: '', kill_points: '', wwcd: '' })
  }

  const extractApiErrorMessage = (payload, fallback) => {
    const base = payload?.Error_Message || payload?.error_message || payload?.message || payload
    if (!base) return fallback
    if (typeof base === 'string') return base
    if (Array.isArray(base) && base.length > 0) return String(base[0])
    if (typeof base === 'object') {
      const firstValue = Object.values(base)[0]
      if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0])
      if (typeof firstValue === 'string') return firstValue
    }
    return fallback
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editingEntry) return

    if (!editForm.match_id) {
      toast.error('Select a match before saving leaderboard points.')
      return
    }

    const result = await dispatch(
      updateLeaderboardEntry({
        entryId: editingEntry.id,
        entryData: {
          match_id: Number(editForm.match_id),
          placement_points: Number(editForm.placement_points || 0),
          kill_points: Number(editForm.kill_points || 0),
          wwcd: Number(editForm.wwcd || 0),
        },
      })
    )

    if (updateLeaderboardEntry.fulfilled.match(result)) {
      toast.success('Leaderboard updated successfully.')
      closeEditPoints()
      return
    }

    toast.error(extractApiErrorMessage(result.payload, 'Failed to update leaderboard entry.'))
  }

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
                  <th className="px-6 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider text-center">Total Pts</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm text-[#94a3b8]">Loading standings...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-red-400 text-sm">
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
                        <td className="px-6 py-4 text-center">
                          <span className={`font-black tracking-tight ${isTop3 ? 'text-blue-400 text-lg' : 'text-white text-base'}`}>
                            {entry.total_points}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => openEditPoints(entry)}
                            disabled={groupMatches.length === 0}
                            title="Edit points"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-[#64748b] text-sm italic">
                      No tournament data available for this group yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {editingEntry && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] rounded-xl shadow-2xl w-full max-w-md border border-[#1e293b] overflow-hidden">
            <div className="p-6 pb-2">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-white">
                  <Pencil className="w-5 h-5 text-[#3b82f6]" />
                  <h2 className="text-xl font-bold">Edit Points</h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditPoints}
                  className="text-[#94a3b8] hover:text-white transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-[#94a3b8] text-sm">
                Update points for {editingEntry.team_name}.
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 pt-2 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-white text-sm font-medium">Match *</label>
                <select
                  required
                  value={editForm.match_id}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, match_id: e.target.value }))}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                >
                  <option value="">Select Completed Match</option>
                  {groupMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      Match {match.match_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-white text-sm font-medium">Placement Points</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.placement_points}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, placement_points: e.target.value }))}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-white text-sm font-medium">Kill Points</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.kill_points}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, kill_points: e.target.value }))}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-white text-sm font-medium">WWCD</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.wwcd}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, wwcd: e.target.value }))}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white hover:bg-[#1e293b] transition-colors text-sm font-medium"
                  onClick={closeEditPoints}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaderBoardCard
