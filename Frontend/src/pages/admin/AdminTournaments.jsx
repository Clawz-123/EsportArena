import React, { useEffect, useState } from 'react'
import AdminPageLayout from './admincomponents/PageLayout'
import StatCardGrid from './admincomponents/StatCardGrid'
import SearchBar from './admincomponents/SearchBar'
import DataTable from './admincomponents/DataTable'
import Modal, { ModalInfoRow } from './admincomponents/Modal'
import { formatDate, formatCurrency, getTournamentStatus, statusBadgeClass } from './admincomponents/adminfunctions'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPublicTournaments } from '../../slices/tournamentSlice'
import {
  Trophy,
  Calendar,
  Gamepad2,
  PlayCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react'

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'Registration', label: 'Registration' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Reg. Closed', label: 'Registration Closed' },
]

const TABLE_HEADERS = [
  { label: 'Tournament' },
  { label: 'Game' },
  { label: 'Format' },
  { label: 'Slots', align: 'center' },
  { label: 'Entry Fee' },
  { label: 'Status' },
  { label: 'Match Start' },
  { label: 'Actions', align: 'right' },
]

const AdminTournaments = () => {
  const dispatch = useAppDispatch()
  const { tournaments, loading } = useAppSelector((s) => s.tournament)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewTournament, setViewTournament] = useState(null)
  const perPage = 12

  useEffect(() => { dispatch(fetchPublicTournaments()) }, [dispatch])

  /* ── Stats ── */
  const ongoingCount = tournaments.filter((t) => getTournamentStatus(t) === 'Ongoing').length
  const regOpenCount = tournaments.filter((t) => getTournamentStatus(t) === 'Registration').length
  const completedCount = tournaments.filter((t) => getTournamentStatus(t) === 'Completed').length

  const statCards = [
    { label: 'Total Tournaments', value: tournaments.length, icon: Trophy, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
    { label: 'Ongoing', value: ongoingCount, icon: PlayCircle, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    { label: 'Registration Open', value: regOpenCount, icon: Calendar, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, iconColor: 'text-gray-400', iconBg: 'bg-gray-500/10' },
  ]

  /* ── Filter & paginate ── */
  const filtered = tournaments.filter((t) => {
    const q = search.toLowerCase()
    const matchesSearch = (t.name || '').toLowerCase().includes(q) || (t.game_title || '').toLowerCase().includes(q)
    return matchesSearch && (statusFilter === 'all' || getTournamentStatus(t) === statusFilter)
  })
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)
  const resetPage = () => setCurrentPage(1)

  return (
    <AdminPageLayout title="Tournaments" subtitle="Manage all platform tournaments">
      <StatCardGrid cards={statCards} />

      <SearchBar
        value={search}
        onChange={(e) => { setSearch(e.target.value); resetPage() }}
        placeholder="Search by name or game..."
        filterValue={statusFilter}
        onFilterChange={(e) => { setStatusFilter(e.target.value); resetPage() }}
        filterOptions={STATUS_FILTER_OPTIONS}
        resultCount={filtered.length}
      />

      <DataTable
        loading={loading}
        headers={TABLE_HEADERS}
        emptyIcon={Trophy}
        emptyText="No tournaments found"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      >
        {paginated.map((t) => {
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
                    {t.organizer_name && <p className="text-[11px] text-[#6B7280]">by {t.organizer_name}</p>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">{t.game_title}</td>
              <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">{t.match_format}</td>
              <td className="px-5 py-3.5 text-xs text-[#9CA3AF] text-center">{t.max_participants}</td>
              <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">
                {t.entry_fee > 0 ? formatCurrency(t.entry_fee) : <span className="text-emerald-400">Free</span>}
              </td>
              <td className="px-5 py-3.5">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadgeClass(status)}`}>{status}</span>
              </td>
              <td className="px-5 py-3.5 text-xs text-[#6B7280]">{formatDate(t.match_start)}</td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end">
                  <button onClick={() => setViewTournament(t)} className="p-1.5 rounded-lg text-[#6B7280] hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </DataTable>

      {/* View Tournament Modal */}
      <Modal open={!!viewTournament} onClose={() => setViewTournament(null)} maxWidth="max-w-lg">
        {viewTournament && (() => {
          const t = viewTournament
          const status = getTournamentStatus(t)
          return (
            <>
              <div className="bg-linear-to-r from-amber-600/20 to-orange-600/20 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10"><Trophy className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#E5E7EB]">{t.name}</h3>
                    <p className="text-xs text-[#9CA3AF]">{t.game_title} · {t.match_format}</p>
                  </div>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${statusBadgeClass(status)}`}>{status}</span>
              </div>

              <div className="px-6 py-5 space-y-4">
                {t.organizer_name && (
                  <div className="flex items-center gap-3 bg-[#0F172A] rounded-lg p-3">
                    {t.organizer_profile_image
                      ? <img src={t.organizer_profile_image} alt="" className="w-8 h-8 rounded-full object-cover border border-[#1F2937]" />
                      : <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-xs font-bold text-[#9CA3AF]">{t.organizer_name[0].toUpperCase()}</div>}
                    <div>
                      <p className="text-[10px] text-[#6B7280] uppercase">Organizer</p>
                      <p className="text-sm text-[#E5E7EB]">{t.organizer_name}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <ModalInfoRow label="Max Slots"><span className="font-medium">{t.max_participants}</span></ModalInfoRow>
                  <ModalInfoRow label="Entry Fee"><span className="font-medium">{t.entry_fee > 0 ? formatCurrency(t.entry_fee) : 'Free'}</span></ModalInfoRow>
                  <ModalInfoRow label="Match Start">{formatDate(t.match_start)}</ModalInfoRow>
                  <ModalInfoRow label="Registration">{formatDate(t.registration_start)} — {formatDate(t.registration_end)}</ModalInfoRow>
                </div>

                <div className="bg-[#0F172A] rounded-lg p-4">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-3">Prize Distribution</p>
                  <div className="flex items-center gap-4">
                    {[
                      { label: '1st Place', val: t.prize_first, color: 'text-amber-400' },
                      { label: '2nd Place', val: t.prize_second, color: 'text-gray-300' },
                      { label: '3rd Place', val: t.prize_third, color: 'text-orange-400' },
                    ].map((p) => (
                      <div key={p.label} className="flex-1 text-center">
                        <p className={`${p.color} text-lg font-bold`}>{formatCurrency(p.val)}</p>
                        <p className="text-[10px] text-[#6B7280]">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {t.description && (
                  <ModalInfoRow label="Description"><span className="text-[#9CA3AF] leading-relaxed">{t.description}</span></ModalInfoRow>
                )}

                <button onClick={() => setViewTournament(null)} className="w-full px-4 py-2.5 rounded-lg bg-[#1F2937] text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors">Close</button>
              </div>
            </>
          )
        })()}
      </Modal>
    </AdminPageLayout>
  )
}

export default AdminTournaments
