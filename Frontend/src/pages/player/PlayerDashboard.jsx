import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchMyJoinedTournaments } from '../../slices/tournamentSlice'
import PlayerSidebar from './PlayerSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import {
  Wallet,
  Trophy,
  Clock,
  CheckCircle,
} from 'lucide-react'

const PlayerDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { joinedTournaments, loading } = useAppSelector((state) => state.tournament)

  useEffect(() => {
    dispatch(fetchMyJoinedTournaments())
  }, [dispatch])

  // Get tournament status
  const getTournamentStatus = (tournament) => {
    if (!tournament) return 'unknown'
    const now = new Date()
    const regStart = new Date(tournament.registration_start)
    const regEnd = new Date(tournament.registration_end)
    const matchStart = new Date(tournament.match_start)
    const matchEnd = tournament.expected_end ? new Date(tournament.expected_end) : null

    if (now < regStart) return 'upcoming'
    if (now >= regStart && now <= regEnd) return 'registration'
    if (now > regEnd && now < matchStart) return 'registration'
    if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'ongoing'
    if (matchEnd && now > matchEnd) return 'completed'
    return 'unknown'
  }

  // Count tournaments by status
  const completedCount = joinedTournaments.filter(t => getTournamentStatus(t) === 'completed').length
  const pendingCount = joinedTournaments.filter(t => getTournamentStatus(t) === 'registration').length

  const stats = [
    {
      label: 'Wallet Balance',
      value: '1,250',
      icon: Wallet,
      color: 'text-[#3B82F6]',
    },
    {
      label: 'Joined Tournaments',
      value: joinedTournaments.length.toString(),
      icon: Trophy,
      color: 'text-[#3B82F6]',
    },
    {
      label: 'Pending Results',
      value: pendingCount.toString(),
      icon: Clock,
      color: 'text-[#F59E0B]',
    },
    {
      label: 'Completed',
      value: completedCount.toString(),
      icon: CheckCircle,
      color: 'text-[#10B981]',
    },
  ]

  // Get recent tournaments (first 3)
  const recentTournaments = joinedTournaments.slice(0, 3).map((tournament) => ({
    id: tournament.id,
    name: tournament.name,
    game: tournament.game_title || 'N/A',
    format: tournament.match_format || 'N/A',
    status: getTournamentStatus(tournament),
  }))

  const statusStyle = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-[#3B82F6] text-white'
      case 'registration':
        return 'bg-[#020617] text-white border border-[#374151]'
      case 'completed':
        return 'bg-[#111827] text-[#E5E7EB] border border-[#374151]'
      case 'upcoming':
        return 'bg-[#1E293B] text-[#3B82F6]'
      default:
        return 'bg-[#111827] text-[#6B7280]'
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <PlayerSidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">Dashboard</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Overview of your tournament activity
            </p>
          </div>

          <ProfileMenu />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E293B] border border-[#1F2937] rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[#9CA3AF] font-medium">
                      {stat.label}
                    </p>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.5} />
                  </div>

                  <p className="text-2xl font-semibold text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Tournaments */}
            <div className="bg-[#1E293B] border border-[#1F2937] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#111827]">
                <h2 className="text-base font-semibold text-[#E5E7EB]">
                  Recent Tournaments
                </h2>
                <button
                  onClick={() => navigate('/player/tournaments')}
                  className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]"
                >
                  View All
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#111827]">
                    <th className="px-6 py-3 text-left text-[13px] text-[#9CA3AF]">Name</th>
                    <th className="px-6 py-3 text-left text-[13px] text-[#9CA3AF]">Game</th>
                    <th className="px-6 py-3 text-left text-[13px] text-[#9CA3AF]">Format</th>
                    <th className="px-6 py-3 text-left text-[13px] text-[#9CA3AF]">Status</th>
                    <th className="px-6 py-3 text-right text-[13px] text-[#9CA3AF]">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <p className="text-sm text-[#9CA3AF]">Loading tournaments...</p>
                      </td>
                    </tr>
                  ) : recentTournaments.length > 0 ? (
                    recentTournaments.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937]/40 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#E5E7EB]">
                          {t.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                          {t.game}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                          {t.format}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium lowercase ${statusStyle(
                              t.status
                            )}`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/player/tournaments/${t.id}`)}
                            className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <p className="text-sm text-[#6B7280]">No tournaments joined yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerDashboard
