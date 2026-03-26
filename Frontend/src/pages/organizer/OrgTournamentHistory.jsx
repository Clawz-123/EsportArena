import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchOrganizerTournamentHistory, setFilters } from '../../slices/tournamentHistorySlice'
import OrgSidebar from './OrgSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import PdfExportButton from '../../components/common/PdfExportButton'
import { Calendar, Coins, Filter, Search, Trophy, Users } from 'lucide-react'

const MONTHS = [
  { value: '', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const normalizeStatus = (status) => {
  if (status === 'Draft') return 'Registration Open'
  return status
}

const getStatusBadgeClass = (status) => {
  const normalized = normalizeStatus(status)
  if (normalized === 'Completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  if (normalized === 'Active') return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  if (normalized === 'Registration Closed') return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
  return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const OrgTournamentHistory = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { organizerHistory, filters } = useAppSelector((state) => state.tournamentHistory)
  const [localFilters, setLocalFilters] = useState(filters)
  const [search, setSearch] = useState('')

  const {
    data: tournaments,
    count,
    completed,
    ongoing,
    registered,
    totalRevenue,
    totalParticipants,
    loading,
    error,
  } = organizerHistory

  useEffect(() => {
    dispatch(fetchOrganizerTournamentHistory(filters))
  }, [dispatch, filters])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const filteredRows = useMemo(() => {
    return (tournaments || []).filter((item) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        (item.name || '').toLowerCase().includes(q) ||
        (item.game_title || '').toLowerCase().includes(q) ||
        (item.match_format || '').toLowerCase().includes(q)
      )
    })
  }, [tournaments, search])

  const applyFilters = () => {
    dispatch(setFilters(localFilters))
  }

  const resetFilters = () => {
    const defaultFilters = {
      status: 'all',
      gameType: null,
      month: null,
      year: new Date().getFullYear(),
    }
    setLocalFilters(defaultFilters)
    dispatch(setFilters(defaultFilters))
    setSearch('')
  }

  const pdfStats = [
    { label: 'Total', value: count || 0 },
    { label: 'Completed', value: completed || 0 },
    { label: 'Ongoing', value: ongoing || 0 },
    { label: 'Registration Open', value: registered || 0 },
    { label: 'Participants', value: totalParticipants || 0 },
    { label: 'Revenue', value: `Rs. ${(totalRevenue || 0).toLocaleString()}` },
  ]

  const pdfColumns = [
    'Tournament',
    'Game/Format',
    'Match Date',
    'Players',
    'Entry Fee',
    'Revenue',
    'Prize Pool',
    'Status',
  ]

  const pdfRows = filteredRows.map((t) => [
    t.name || '-',
    `${t.game_title || '-'} / ${t.match_format || '-'}`,
    formatDate(t.match_start),
    `${t.participants_count || 0}/${t.max_participants || 0}`,
    t.entry_fee > 0 ? `Rs. ${t.entry_fee}` : 'Free',
    `Rs. ${(t.revenue || 0).toLocaleString()}`,
    `Rs. ${(t.total_prize_pool || 0).toLocaleString()}`,
    normalizeStatus(t.status),
  ])

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <OrgSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">Tournament History</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Review all tournaments you organized</p>
          </div>
          <ProfileMenu />
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4"><p className="text-xs text-[#9CA3AF]">Total</p><p className="text-2xl font-bold text-[#E5E7EB] mt-1">{count || 0}</p></div>
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4"><p className="text-xs text-[#9CA3AF]">Completed</p><p className="text-2xl font-bold text-emerald-600 mt-1">{completed || 0}</p></div>
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4"><p className="text-xs text-[#9CA3AF]">Ongoing</p><p className="text-2xl font-bold text-amber-600 mt-1">{ongoing || 0}</p></div>
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4"><p className="text-xs text-[#9CA3AF]">Registration Open</p><p className="text-2xl font-bold text-blue-600 mt-1">{registered || 0}</p></div>
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4"><p className="text-xs text-[#9CA3AF]">Participants</p><p className="text-2xl font-bold text-indigo-600 mt-1">{totalParticipants || 0}</p></div>
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4"><p className="text-xs text-[#9CA3AF]">Revenue</p><p className="text-xl font-bold text-emerald-700 mt-1">Rs. {(totalRevenue || 0).toLocaleString()}</p></div>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tournament"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0F172A] border border-[#1F2937] rounded-lg text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <select value={localFilters.status} onChange={(e) => setLocalFilters((prev) => ({ ...prev, status: e.target.value }))} className="px-3 py-2.5 bg-[#0F172A] border border-[#1F2937] rounded-lg text-sm text-[#E5E7EB]">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="registered">Registration Open</option>
              </select>

              <select value={localFilters.gameType || ''} onChange={(e) => setLocalFilters((prev) => ({ ...prev, gameType: e.target.value || null }))} className="px-3 py-2.5 bg-[#0F172A] border border-[#1F2937] rounded-lg text-sm text-[#E5E7EB]">
                <option value="">All Games</option>
                <option value="PUBG Mobile">PUBG Mobile</option>
                <option value="Free Fire">Free Fire</option>
              </select>

              <select value={localFilters.month || ''} onChange={(e) => setLocalFilters((prev) => ({ ...prev, month: e.target.value ? parseInt(e.target.value) : null }))} className="px-3 py-2.5 bg-[#0F172A] border border-[#1F2937] rounded-lg text-sm text-[#E5E7EB]">
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select value={localFilters.year} onChange={(e) => setLocalFilters((prev) => ({ ...prev, year: parseInt(e.target.value) }))} className="px-3 py-2.5 bg-[#0F172A] border border-[#1F2937] rounded-lg text-sm text-[#E5E7EB]">
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button onClick={applyFilters} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                <Filter className="w-4 h-4" />
                Apply
              </button>
              <button onClick={resetFilters} className="px-4 py-2 border border-[#374151] text-[#E5E7EB] text-sm rounded-lg hover:bg-[#1F2937]">Reset</button>
              <PdfExportButton
                reportTitle="Organizer Tournament History"
                stats={pdfStats}
                columns={pdfColumns}
                rows={pdfRows}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg"
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1F2937] flex items-center justify-between">
              <h2 className="font-semibold text-[#E5E7EB]">Tournament Records</h2>
              <p className="text-sm text-[#9CA3AF]">{filteredRows.length} found</p>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-[#9CA3AF]">Loading tournament history...</div>
            ) : filteredRows.length === 0 ? (
              <div className="p-10 text-center text-[#9CA3AF]">
                <Trophy className="w-10 h-10 mx-auto mb-3 text-[#6B7280]" />
                No tournament history found for selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#0F172A] text-[#9CA3AF]">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Tournament</th>
                      <th className="text-left px-4 py-3 font-medium">Game</th>
                      <th className="text-left px-4 py-3 font-medium">Match Date</th>
                      <th className="text-left px-4 py-3 font-medium">Players</th>
                      <th className="text-left px-4 py-3 font-medium">Revenue</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/organizer/tournaments/${t.id}`)}
                        className="border-t border-[#1F2937] hover:bg-[#1F2937]/50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#E5E7EB]">{t.name}</p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">Prize: Rs. {(t.total_prize_pool || 0).toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-3 text-[#9CA3AF]">{t.game_title} · {t.match_format}</td>
                        <td className="px-4 py-3 text-[#9CA3AF] inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#6B7280]" />{formatDate(t.match_start)}</td>
                        <td className="px-4 py-3 text-[#E5E7EB] inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-[#6B7280]" />{t.participants_count || 0}/{t.max_participants}</td>
                        <td className="px-4 py-3 text-[#E5E7EB] inline-flex items-center gap-1.5"><Coins className="w-4 h-4 text-[#6B7280]" />Rs. {(t.revenue || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs rounded-full border ${getStatusBadgeClass(t.status)}`}>
                            {normalizeStatus(t.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrgTournamentHistory
