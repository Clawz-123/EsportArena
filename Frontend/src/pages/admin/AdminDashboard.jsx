import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAdminDashboardStats } from '../../slices/adminSlice'
import AdminSidebar from './AdminSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import {
  Users,
  Trophy,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
} from 'lucide-react'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { stats, loading } = useAppSelector((state) => state.admin)

  useEffect(() => {
    dispatch(fetchAdminDashboardStats())
  }, [dispatch])

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users?.total ?? '—',
      sublabel: `${stats?.users?.players ?? 0} Players · ${stats?.users?.organizers ?? 0} Organizers`,
      icon: Users,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Tournaments',
      value: stats?.tournaments?.total ?? '—',
      sublabel: `${stats?.tournaments?.active ?? 0} Active · ${stats?.tournaments?.completed ?? 0} Completed`,
      icon: Trophy,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      label: 'Revenue (NPR)',
      value: stats ? `₨ ${Number(stats.revenue?.total || 0).toLocaleString()}` : '—',
      sublabel: `₨ ${Number(stats?.revenue?.last_30_days || 0).toLocaleString()} last 30 days`,
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Withdrawals',
      value: stats?.withdrawals?.pending ?? '—',
      sublabel: `Pending approval`,
      icon: CreditCard,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
      action: () => navigate('/admin/withdrawals'),
    },
  ]

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const roleBadge = (role) => {
    const styles = {
      Player: 'border-blue-500/30 text-blue-400',
      Organizer: 'border-amber-500/30 text-amber-400',
      SuperAdmin: 'border-red-500/30 text-red-400',
    }
    return styles[role] || 'border-gray-500/30 text-gray-400'
  }

  const txTypeBadge = (type) => {
    const map = {
      deposit: 'text-emerald-400',
      withdrawal: 'text-rose-400',
      entry_fee: 'text-blue-400',
      prize: 'text-amber-400',
      refund: 'text-purple-400',
    }
    return map[type] || 'text-gray-400'
  }

  return (
    <div className="flex h-screen bg-[#0F172A]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">Admin Dashboard</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Platform overview and management
            </p>
          </div>
          <ProfileMenu />
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && (
              <>
                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={card.action}
                      className={`bg-[#111827] border border-[#1F2937] rounded-xl p-5 transition-all ${
                        card.action ? 'cursor-pointer hover:border-[#374151]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                          <card.icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={1.8} />
                        </div>
                        {card.action && (
                          <ArrowUpRight className="w-4 h-4 text-[#6B7280]" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {card.value}
                      </div>
                      <p className="text-xs text-[#6B7280] font-medium">{card.label}</p>
                      <p className="text-[11px] text-[#4B5563] mt-1">{card.sublabel}</p>
                    </div>
                  ))}
                </div>

                {/* ── Tables Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
                      <h2 className="text-sm font-semibold text-[#E5E7EB]">Recent Users</h2>
                      <button
                        onClick={() => navigate('/admin/users')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <div className="divide-y divide-[#1F2937]">
                      {(stats?.recent_users ?? []).length > 0 ? (
                        stats.recent_users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#1F2937]/30 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-xs font-bold text-[#9CA3AF] shrink-0">
                                {(user.name || user.email || '?')[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-[#E5E7EB] font-medium truncate">
                                  {user.name || user.email}
                                </p>
                                <p className="text-[11px] text-[#6B7280] truncate">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold ${roleBadge(user.role)}`}>
                                {user.role}
                              </span>
                              {user.is_verified ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-8 text-center text-sm text-[#6B7280]">
                          No users yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Tournaments */}
                  <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
                      <h2 className="text-sm font-semibold text-[#E5E7EB]">Recent Tournaments</h2>
                      <button
                        onClick={() => navigate('/admin/tournaments')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <div className="divide-y divide-[#1F2937]">
                      {(stats?.recent_tournaments ?? []).length > 0 ? (
                        stats.recent_tournaments.map((t) => (
                          <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#1F2937]/30 transition-colors">
                            <div className="min-w-0">
                              <p className="text-sm text-[#E5E7EB] font-medium truncate">{t.name}</p>
                              <p className="text-[11px] text-[#6B7280]">{t.game_title} · {t.match_format}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-xs text-[#9CA3AF]">{t.max_participants} slots</p>
                              <p className="text-[11px] text-[#4B5563]">
                                {formatDate(t.match_start)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-8 text-center text-sm text-[#6B7280]">
                          No tournaments yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Recent Transactions ── */}
                <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
                    <h2 className="text-sm font-semibold text-[#E5E7EB]">Recent Transactions</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1F2937]">
                          <th className="px-5 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">User</th>
                          <th className="px-5 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Type</th>
                          <th className="px-5 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Method</th>
                          <th className="px-5 py-3 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Amount</th>
                          <th className="px-5 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F2937]">
                        {(stats?.recent_transactions ?? []).length > 0 ? (
                          stats.recent_transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#1F2937]/30 transition-colors">
                              <td className="px-5 py-3 text-sm text-[#E5E7EB]">
                                {tx.wallet__user__email}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-xs font-medium capitalize ${txTypeBadge(tx.transaction_type)}`}>
                                  {tx.transaction_type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-xs text-[#9CA3AF] capitalize">
                                {tx.method}
                              </td>
                              <td className={`px-5 py-3 text-sm font-medium text-right ${
                                tx.direction === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {tx.direction === 'credit' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-medium capitalize ${
                                  tx.status === 'completed' ? 'text-emerald-400' :
                                  tx.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    tx.status === 'completed' ? 'bg-emerald-400' :
                                    tx.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'
                                  }`} />
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-xs text-[#6B7280] text-right">
                                {formatTime(tx.created_at)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-5 py-8 text-center text-sm text-[#6B7280]">
                              No transactions yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
