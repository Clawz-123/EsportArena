import React from 'react'
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

const OrgDashboard = () => {
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Created',
      value: '24',
      sublabel: 'Total Tournaments',
      icon: Trophy,
      iconColor: 'text-[#3B82F6]',
      valueColor: 'text-white'
    },
    {
      label: 'Tournaments',
      value: '8',
      sublabel: 'Active',
      icon: Calendar,
      iconColor: 'text-[#3B82F6]',
      valueColor: 'text-white'
    },
    {
      label: 'Tournaments',
      value: '16',
      sublabel: 'Completed',
      icon: CheckCircle,
      iconColor: 'text-[#10B981]',
      valueColor: 'text-white'
    },
    {
      label: 'To verify',
      value: '5',
      sublabel: 'Pending Results',
      icon: Clock,
      iconColor: 'text-[#F59E0B]',
      valueColor: 'text-white'
    },
  ]

  const recentTournaments = [
    {
      id: 1,
      name: 'PUBG Spring Championship',
      game: 'PUBG',
      format: 'Single Elimination',
      registrations: '32/32',
      status: 'Ongoing',
    },
    {
      id: 2,
      name: 'Free Fire Weekly Cup #45',
      game: 'Free Fire',
      format: 'Round Robin',
      registrations: '18/24',
      status: 'Registration',
    },
    {
      id: 3,
      name: 'PUBG Pro League Qualifier',
      game: 'PUBG',
      format: 'Double Elimination',
      registrations: '0/16',
      status: 'Draft',
    },
  ]

  const pendingVerifications = [
    {
      id: 1,
      match: 'Squad A vs Squad B - Semifinal',
      tournament: 'PUBG Spring Championship',
      time: '2 hours ago',
    },
    {
      id: 2,
      match: 'FireStars vs ShadowClan - Final',
      tournament: 'Free Fire Weekly Cup #44',
      time: '4 hours ago',
    },
    {
      id: 3,
      match: 'Wolves vs Dragons - Quarterfinal',
      tournament: 'PUBG Pro League Qualifier',
      time: '6 hours ago',
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
              onClick={() => navigate('/organizer/create')}
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
                  onClick={() => navigate('/organizer/tournaments')}
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
                    {recentTournaments.map((tournament) => (
                      <tr
                        key={tournament.id}
                        className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937]/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#E5E7EB] font-medium">
                          {tournament.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                          {tournament.game}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                          {tournament.format}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                          {tournament.registrations}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${tournament.status === 'Ongoing'
                              ? 'bg-transparent border-[#3B82F6] text-[#3B82F6]'
                              : tournament.status === 'Registration'
                                ? 'bg-transparent border-[#6B7280] text-[#9CA3AF]'
                                : 'bg-transparent border-[#6B7280] text-[#6B7280]'
                              }`}
                          >
                            {tournament.status}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Result Verifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#E5E7EB]">
                  Pending Result Verifications <span className="text-[#6B7280]">(5)</span>
                </h2>
                <button
                  onClick={() => navigate('/organizer/result-verification')}
                  className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
                >
                  Review All
                </button>
              </div>
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1F2937]">
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Match
                      </th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Tournament
                      </th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingVerifications.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937]/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/organizer/result-verification/${item.id}`)}
                      >
                        <td className="px-6 py-4 text-sm text-[#E5E7EB] font-medium">
                          {item.match}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                          {item.tournament}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            <span>{item.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/organizer/result-verification/${item.id}`)
                            }}
                            className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
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
