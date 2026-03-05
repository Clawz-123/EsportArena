import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAdminDashboardStats } from '../../slices/adminSlice'
import AdminPageLayout from './admincomponents/PageLayout'
import StatCardGrid from './admincomponents/StatCardGrid'
import UserAvatar from './admincomponents/UserAvatar'
import { formatDate, formatDateTime, roleBadgeClass } from './admincomponents/adminfunctions'
import { Users, Trophy, CreditCard, TrendingUp, CheckCircle, Clock } from 'lucide-react'

const TX_TYPE_COLORS = {
  deposit: 'text-emerald-400',
  withdrawal: 'text-rose-400',
  entry_fee: 'text-blue-400',
  prize: 'text-amber-400',
  refund: 'text-purple-400',
}

const STATUS_DOT = {
  completed: 'bg-emerald-400 text-emerald-400',
  pending: 'bg-amber-400 text-amber-400',
  failed: 'bg-rose-400 text-rose-400',
}

/* ── Small list card used for Recent Users / Tournaments ── */
const ListCard = ({ title, onViewAll, emptyText, children }) => (
  <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
      <h2 className="text-sm font-semibold text-[#E5E7EB]">{title}</h2>
      {onViewAll && (
        <button onClick={onViewAll} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
          View All
        </button>
      )}
    </div>
    <div className="divide-y divide-[#1F2937]">
      {children ?? <div className="px-5 py-8 text-center text-sm text-[#6B7280]">{emptyText}</div>}
    </div>
  </div>
)

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
      sublabel: 'Pending approval',
      icon: CreditCard,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
      action: () => navigate('/admin/withdrawals'),
    },
  ]

  const recentUsers = stats?.recent_users ?? []
  const recentTournaments = stats?.recent_tournaments ?? []
  const recentTransactions = stats?.recent_transactions ?? []

  return (
    <AdminPageLayout title="Admin Dashboard" subtitle="Platform overview and management">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <StatCardGrid cards={statCards} />

          {/* Recent Users & Tournaments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ListCard title="Recent Users" onViewAll={() => navigate('/admin/users')} emptyText="No users yet">
              {recentUsers.length > 0
                ? recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#1F2937]/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar user={user} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm text-[#E5E7EB] font-medium truncate">{user.name || user.email}</p>
                          <p className="text-[11px] text-[#6B7280] truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold ${roleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                        {user.is_verified ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                    </div>
                  ))
                : null}
            </ListCard>

            <ListCard title="Recent Tournaments" onViewAll={() => navigate('/admin/tournaments')} emptyText="No tournaments yet">
              {recentTournaments.length > 0
                ? recentTournaments.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#1F2937]/30 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm text-[#E5E7EB] font-medium truncate">{t.name}</p>
                        <p className="text-[11px] text-[#6B7280]">{t.game_title} · {t.match_format}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs text-[#9CA3AF]">{t.max_participants} slots</p>
                        <p className="text-[11px] text-[#4B5563]">{formatDate(t.match_start)}</p>
                      </div>
                    </div>
                  ))
                : null}
            </ListCard>
          </div>

          {/* Recent Transactions */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1F2937]">
              <h2 className="text-sm font-semibold text-[#E5E7EB]">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1F2937]">
                    {['User', 'Type', 'Method', 'Amount', 'Status', 'Date'].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider ${i === 3 || i === 5 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => {
                      const dotColor = STATUS_DOT[tx.status] || STATUS_DOT.failed
                      return (
                        <tr key={tx.id} className="hover:bg-[#1F2937]/30 transition-colors">
                          <td className="px-5 py-3 text-sm text-[#E5E7EB]">{tx.wallet__user__email}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-medium capitalize ${TX_TYPE_COLORS[tx.transaction_type] || 'text-gray-400'}`}>
                              {tx.transaction_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-[#9CA3AF] capitalize">{tx.method}</td>
                          <td className={`px-5 py-3 text-sm font-medium text-right ${tx.direction === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.direction === 'credit' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium capitalize ${dotColor.split(' ')[1]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor.split(' ')[0]}`} />
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-[#6B7280] text-right">{formatDateTime(tx.created_at)}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-sm text-[#6B7280]">No transactions yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminPageLayout>
  )
}

export default AdminDashboard
