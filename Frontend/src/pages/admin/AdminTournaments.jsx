import React, { useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import Pagination from '../../components/Pagination/Pagination'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPublicTournaments } from '../../slices/tournamentSlice'
import {
  Trophy,
  Search,
  Calendar,
  Gamepad2,
  PlayCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react'

const AdminTournaments = () => {
  const dispatch = useAppDispatch()
  const { tournaments, loading } = useAppSelector((state) => state.tournament)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewTournament, setViewTournament] = useState(null)
  const perPage = 12

  useEffect(() => {
    dispatch(fetchPublicTournaments())
  }, [dispatch])

  const getTournamentStatus = (t) => {
    if (t.is_draft) return 'Draft'
    const now = new Date()
    const regStart = new Date(t.registration_start)
    const regEnd = new Date(t.registration_end)
    const matchStart = new Date(t.match_start)
    const matchEnd = t.expected_end ? new Date(t.expected_end) : null

    if (now < regStart) return 'Upcoming'
    if (now >= regStart && now <= regEnd) return 'Registration'
    if (now > regEnd && now < matchStart) return 'Reg. Closed'
    if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'Ongoing'
    if (matchEnd && now > matchEnd) return 'Completed'
    return 'Unknown'
  }

  const statusBadge = (status) => {
    const map = {
      Ongoing: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      Registration: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      Completed: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
      Upcoming: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      Draft: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      'Reg. Closed': 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    }
    return map[status] || 'bg-gray-500/10 border-gray-500/30 text-gray-400'
  }

  // Stats
  const totalTournaments = tournaments.length
  const ongoingCount = tournaments.filter((t) => getTournamentStatus(t) === 'Ongoing').length
  const regOpenCount = tournaments.filter((t) => getTournamentStatus(t) === 'Registration').length
  const completedCount = tournaments.filter((t) => getTournamentStatus(t) === 'Completed').length

  const statCards = [
    {
      label: 'Total Tournaments',
      value: totalTournaments,
      icon: Trophy,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      label: 'Ongoing',
      value: ongoingCount,
      icon: PlayCircle,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Registration Open',
      value: regOpenCount,
      icon: Calendar,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      iconColor: 'text-gray-400',
      iconBg: 'bg-gray-500/10',
    },
  ]

  const filtered = tournaments.filter((t) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (t.name || '').toLowerCase().includes(q) ||
      (t.game_title || '').toLowerCase().includes(q)
    const status = getTournamentStatus(t)
    const matchesStatus = statusFilter === 'all' || status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatPrize = (val) => {
    if (!val) return '—'
    return `₨ ${Number(val).toLocaleString()}`
  }

  return (
    <div className="flex h-screen bg-[#0F172A]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">Tournaments</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Manage all platform tournaments</p>
          </div>
          <ProfileMenu />
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-350 mx-auto p-6 space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#111827] border border-[#1F2937] rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                      <card.icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={1.8} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                  <p className="text-xs text-[#6B7280] font-medium">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Search + Status Filter */}
            <div className="flex items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search by name or game..."
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-blue-500/40"
                />
              </div>
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="px-4 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#E5E7EB] focus:outline-none focus:border-blue-500/40 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Registration">Registration</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
              </select>
              <span className="text-xs text-[#6B7280]">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1F2937]">
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Tournament</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Game</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Format</th>
                        <th className="px-5 py-3.5 text-center text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Slots</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Entry Fee</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Match Start</th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                      {paginated.length > 0 ? (
                        paginated.map((t) => {
                          const status = getTournamentStatus(t)
                          return (
                            <tr key={t.id} className="hover:bg-[#1F2937]/30 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                    <Gamepad2 className="w-4 h-4 text-amber-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-[#E5E7EB] font-medium">{t.name}</p>
                                    {t.organizer_name && (
                                      <p className="text-[11px] text-[#6B7280]">by {t.organizer_name}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">{t.game_title}</td>
                              <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">{t.match_format}</td>
                              <td className="px-5 py-3.5 text-xs text-[#9CA3AF] text-center">{t.max_participants}</td>
                              <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">
                                {t.entry_fee > 0 ? formatPrize(t.entry_fee) : <span className="text-emerald-400">Free</span>}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge(status)}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-xs text-[#6B7280]">{formatDate(t.match_start)}</td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-end">
                                  <button
                                    onClick={() => setViewTournament(t)}
                                    className="p-1.5 rounded-lg text-[#6B7280] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                    title="View tournament"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-5 py-12 text-center">
                            <Trophy className="w-8 h-8 text-[#374151] mx-auto mb-2" />
                            <p className="text-sm text-[#6B7280]">No tournaments found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>
        </div>
      </div>

      {/* View Tournament Modal */}
      {viewTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewTournament(null)}>
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#E5E7EB]">{viewTournament.name}</h3>
                  <p className="text-xs text-[#9CA3AF]">{viewTournament.game_title} · {viewTournament.match_format}</p>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${statusBadge(getTournamentStatus(viewTournament))}`}>
                {getTournamentStatus(viewTournament)}
              </span>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Organizer */}
              {viewTournament.organizer_name && (
                <div className="flex items-center gap-3 bg-[#0F172A] rounded-lg p-3">
                  {viewTournament.organizer_profile_image ? (
                    <img src={viewTournament.organizer_profile_image} alt="" className="w-8 h-8 rounded-full object-cover border border-[#1F2937]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-xs font-bold text-[#9CA3AF]">
                      {viewTournament.organizer_name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-[#6B7280] uppercase">Organizer</p>
                    <p className="text-sm text-[#E5E7EB]">{viewTournament.organizer_name}</p>
                  </div>
                </div>
              )}

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0F172A] rounded-lg p-3">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Max Slots</p>
                  <p className="text-sm text-[#E5E7EB] font-medium">{viewTournament.max_participants}</p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-3">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Entry Fee</p>
                  <p className="text-sm text-[#E5E7EB] font-medium">
                    {viewTournament.entry_fee > 0 ? formatPrize(viewTournament.entry_fee) : 'Free'}
                  </p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-3">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Match Start</p>
                  <p className="text-sm text-[#E5E7EB]">{formatDate(viewTournament.match_start)}</p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-3">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Registration</p>
                  <p className="text-sm text-[#E5E7EB]">{formatDate(viewTournament.registration_start)} — {formatDate(viewTournament.registration_end)}</p>
                </div>
              </div>

              {/* Prize Pool */}
              <div className="bg-[#0F172A] rounded-lg p-4">
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-3">Prize Distribution</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-amber-400 text-lg font-bold">{formatPrize(viewTournament.prize_first)}</p>
                    <p className="text-[10px] text-[#6B7280]">1st Place</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-gray-300 text-lg font-bold">{formatPrize(viewTournament.prize_second)}</p>
                    <p className="text-[10px] text-[#6B7280]">2nd Place</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-orange-400 text-lg font-bold">{formatPrize(viewTournament.prize_third)}</p>
                    <p className="text-[10px] text-[#6B7280]">3rd Place</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewTournament.description && (
                <div className="bg-[#0F172A] rounded-lg p-3">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{viewTournament.description}</p>
                </div>
              )}

              <button
                onClick={() => setViewTournament(null)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#1F2937] text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTournaments
