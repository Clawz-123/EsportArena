import React from 'react'
import { useNavigate } from 'react-router-dom'
import PlayerSidebar from './PlayerSidebar'
import {
  Wallet,
  Trophy,
  Clock,
  CheckCircle,
} from 'lucide-react'

const PlayerDashboard = () => {
  const navigate = useNavigate()

  const stats = [
    {
      label: 'Coins',
      value: '1,250',
      sublabel: 'Wallet Balance',
      icon: Wallet,
      iconColor: 'text-[#3B82F6]',
    },
    {
      label: 'Joined',
      value: '8',
      sublabel: 'Tournaments',
      icon: Trophy,
      iconColor: 'text-[#3B82F6]',
    },
    {
      label: 'Pending',
      value: '1',
      sublabel: 'Results',
      icon: Clock,
      iconColor: 'text-[#F59E0B]',
    },
    {
      label: 'Completed',
      value: '5',
      sublabel: 'Tournaments',
      icon: CheckCircle,
      iconColor: 'text-[#10B981]',
    },
  ]

  const recentTournaments = [
    { id: 1, name: 'PUBG Mobile Championship', game: 'PUBG Mobile', format: 'Squad', status: 'Ongoing' },
    { id: 2, name: 'Free Fire League', game: 'Free Fire', format: 'Duo', status: 'Upcoming' },
    { id: 3, name: 'PUBG Weekly', game: 'PUBG Mobile', format: 'Solo', status: 'Completed' },
  ]

  const statusStyle = (status) => {
    switch (status) {
      case 'Ongoing':
        return 'border-[#10B981] text-[#10B981]'
      case 'Upcoming':
        return 'border-[#3B82F6] text-[#3B82F6]'
      case 'Completed':
        return 'border-[#9CA3AF] text-[#9CA3AF]'
      default:
        return 'border-[#6B7280] text-[#6B7280]'
    }
  }

  return (
    <div className="flex h-screen bg-[#0F172A]">
      <PlayerSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6">
          <h1 className="text-2xl font-bold text-[#E5E7EB]">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Overview of your tournament activity
          </p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-300 mx-auto p-6 space-y-6">

            {/* Stats */}
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
                  <div className="text-[22px] text-white font-semibold mb-1">
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
                  onClick={() => navigate('/player/tournaments')}
                  className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
                >
                  View All
                </button>
              </div>

              <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1F2937]">
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Name</th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Game</th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Format</th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Status</th>
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTournaments.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937]/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#E5E7EB] font-medium">{t.name}</td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">{t.game}</td>
                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">{t.format}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyle(t.status)}`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/player/tournaments/${t.id}`)}
                            className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
                          >
                            View
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

export default PlayerDashboard
