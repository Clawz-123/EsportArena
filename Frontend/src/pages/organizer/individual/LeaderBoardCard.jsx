/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useState } from 'react'
import { Trophy, Medal, ChevronDown, Pencil } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentBracket } from '../../../slices/BracketSlice'
import { fetchLeaderboardEntries, updateLeaderboardEntry } from '../../../slices/leaderBoardSlice'

const LeaderBoardCard = ({ tournamentId }) => {
  const dispatch = useAppDispatch()
  const { bracket } = useAppSelector((state) => state.bracket)
  const { entries, loading, error, updateLoading } = useAppSelector((state) => state.leaderboard || {})
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [editingEntry, setEditingEntry] = useState(null)
  const [editForm, setEditForm] = useState({
    placement_points: '',
    kill_points: '',
    wwcd: '',
  })

  // Fetching bracket data when tournamentId changes to populate group options
  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentBracket(tournamentId))
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

  const openEditPoints = (entry) => {
    setEditingEntry(entry)
    setEditForm({
      placement_points: String(entry.placement_points ?? ''),
      kill_points: String(entry.kill_points ?? ''),
      wwcd: String(entry.wwcd ?? ''),
    })
  }

  const closeEditPoints = () => {
    setEditingEntry(null)
    setEditForm({ placement_points: '', kill_points: '', wwcd: '' })
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!editingEntry) return

     dispatch(
      updateLeaderboardEntry({
        entryId: editingEntry.id,
        entryData: {
          placement_points: Number(editForm.placement_points || 0),
          kill_points: Number(editForm.kill_points || 0),
          wwcd: Number(editForm.wwcd || 0),
        },
      })
    )
    closeEditPoints()
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
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#9CA3AF] uppercase">Edit</th>
               </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">Loading leaderboard...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
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
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-[#9CA3AF] hover:text-white inline-flex items-center gap-2 text-sm transition-colors"
                        onClick={() => openEditPoints(entry)}
                        title="Edit points"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <p className="text-sm text-[#9CA3AF]">No leaderboard data yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
