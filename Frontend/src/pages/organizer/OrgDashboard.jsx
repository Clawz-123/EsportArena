import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OrgSidebar from './OrgSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import {
  Plus,
  Trophy,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchOrganizerTournaments } from '../../slices/tournamentSlice'

const OrgDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { tournaments, loading } = useAppSelector((state) => state.tournament)

  useEffect(() => {
    dispatch(fetchOrganizerTournaments())
  }, [dispatch])

  const getTournamentStatus = (tournament) => {
    if (tournament.is_draft) return 'Draft'
    const now = new Date()
    const regStart = new Date(tournament.registration_start)
    const regEnd = new Date(tournament.registration_end)
    const matchStart = new Date(tournament.match_start)
    const matchEnd = tournament.expected_end ? new Date(tournament.expected_end) : null

    if (now < regStart) return 'Upcoming'
    if (now >= regStart && now <= regEnd) return 'Registration'
    if (now > regEnd && now < matchStart) return 'Registration Closed'
    if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'Ongoing'
    if (matchEnd && now > matchEnd) return 'Completed'
    return 'Unknown'
  }

  // Calculate stats from actual tournaments
  const totalTournaments = tournaments.length
  const activeTournaments = tournaments.filter(
    (t) => ['Registration', 'Ongoing'].includes(getTournamentStatus(t))
  ).length
  const completedTournaments = tournaments.filter(
    (t) => getTournamentStatus(t) === 'Completed'
  ).length
  const draftTournaments = tournaments.filter((t) => t.is_draft).length

  // Get recent tournaments (last 3)
  const recentTournaments = tournaments.slice(0, 3)

  const stats = [
    {
      label: 'Created',
      value: totalTournaments.toString(),
      sublabel: 'Total Tournaments',
      icon: Trophy,
      iconColor: 'text-[#3B82F6]',
      valueColor: 'text-white'
    },
    {
      label: 'Tournaments',
      value: activeTournaments.toString(),
      sublabel: 'Active',
      icon: Calendar,
      iconColor: 'text-[#3B82F6]',
      valueColor: 'text-white'
    },
    {
      label: 'Tournaments',
      value: completedTournaments.toString(),
      sublabel: 'Completed',
      icon: CheckCircle,
      iconColor: 'text-[#10B981]',
      valueColor: 'text-white'
    },
    {
      label: 'Drafts',
      value: draftTournaments.toString(),
      sublabel: 'Draft Tournaments',
      icon: Clock,
      iconColor: 'text-[#F59E0B]',
      valueColor: 'text-white'
    },
  ]


  return (
    <div className="flex h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <OrgSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">Dashboard</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Overview of your tournament management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/OrgCreateTournament')}
              className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Tournament
            </button>

            {/* Profile Menu Component */}
            <ProfileMenu />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-300 mx-auto p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-[#111827] border border-[#1F2937] rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-[#6B7280] tracking-wide">
                      {stat.sublabel}
                    </span>
                    <stat.icon
                      className={`w-5 h-5 ${stat.iconColor}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className={`text-[22px] ${stat.valueColor} font-semibold mb-1`}>
                    {stat.value}
                  </div>
                  <p className="text-sm text-[#6B7280]">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Tournaments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#E5E7EB]">
                  Recent Tournaments
                </h2>
                <button
                  onClick={() => navigate('/OrgTournaments')}
                  className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
                >
                  View All
                </button>
              </div>
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1F2937]">
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Game
                      </th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Registrations
                      </th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <p className="text-sm text-[#9CA3AF]">
                            Loading tournaments...
                          </p>
                        </td>
                      </tr>
                    ) : recentTournaments.length > 0 ? (
                      recentTournaments.map((tournament) => {
                        const status = getTournamentStatus(tournament)
                        return (
                          <tr
                            key={tournament.id}
                            className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937]/30 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-[#E5E7EB] font-medium">
                              {tournament.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                              {tournament.game_title}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                              {tournament.match_format}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                              0/{tournament.max_participants}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                  status === 'Ongoing'
                                    ? 'bg-transparent border-[#10B981] text-[#10B981]'
                                    : status === 'Registration'
                                    ? 'bg-transparent border-[#3B82F6] text-[#3B82F6]'
                                    : status === 'Completed'
                                    ? 'bg-transparent border-[#9CA3AF] text-[#9CA3AF]'
                                    : 'bg-transparent border-[#6B7280] text-[#6B7280]'
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => navigate(`/organizer/tournaments/${tournament.id}`)}
                                className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <p className="text-sm text-[#6B7280]">
                            No tournaments yet. Create your first tournament!
                          </p>
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
    </div>
  )
}

export default OrgDashboard
