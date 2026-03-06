import React, { useEffect, useState } from 'react'
import AdminPageLayout from './admincomponents/PageLayout'
import DataTable from './admincomponents/DataTable'
import { formatDateTime } from './admincomponents/adminfunctions'
import axiosInstance from '../../axios/axiousinstance'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-toastify'

const FILTERS = ['all', 'pending', 'completed', 'failed']

const TABLE_HEADERS = [
  { label: 'User' },
  { label: 'Provider' },
  { label: 'Account' },
  { label: 'Coins', align: 'right' },
  { label: 'Fee', align: 'right' },
  { label: 'Payout', align: 'right' },
  { label: 'Status' },
  { label: 'Requested' },
  { label: 'Actions', align: 'center' },
]

const STATUS_ICONS = { pending: Clock, completed: CheckCircle, failed: XCircle }
const STATUS_CLASSES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const AdminPayment = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  const fetchWithdrawals = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/payment/admin/withdrawals/')
      setWithdrawals(res.data.Result?.withdrawals || res.data.Result || [])
    } catch { toast.error('Failed to load withdrawal requests') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchWithdrawals() }, [])

  const handleAction = async (id, action) => {
    setActionLoading(id)
    try {
      await axiosInstance.post(`/payment/admin/withdrawals/${id}/${action}/`)
      toast.success(`Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      fetchWithdrawals()
    } catch (err) {
      toast.error(err.response?.data?.Error_Message || `Failed to ${action} withdrawal`)
    } finally { setActionLoading(null) }
  }

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter((w) => w.status === filter)
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)
  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length

  const subtitle = (
    <>
      Review and manage withdrawal requests
      {pendingCount > 0 && (
        <span className="ml-2 px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[11px] font-semibold">
          {pendingCount} pending
        </span>
      )}
    </>
  )

  const headerRight = (
    <button
      onClick={fetchWithdrawals}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-[#9CA3AF] text-sm hover:border-[#374151] transition-colors"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      Refresh
    </button>
  )

  return (
    <AdminPageLayout title="Withdrawal Requests" subtitle={subtitle} headerRight={headerRight}>
      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setCurrentPage(1) }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : 'bg-[#111827] text-[#6B7280] border border-[#1F2937] hover:border-[#374151]'
            }`}
          >
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <DataTable
        loading={loading}
        headers={TABLE_HEADERS}
        emptyIcon={CreditCard}
        emptyText={filter === 'all' ? 'No withdrawal requests yet' : `No ${filter} withdrawals`}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      >
        {paginated.map((w) => {
          const Icon = STATUS_ICONS[w.status]
          return (
            <tr key={w.id} className="hover:bg-[#1F2937]/30 transition-colors">
              <td className="px-5 py-3">
                <p className="text-sm text-[#E5E7EB] font-medium">{w.user_email || w.user}</p>
                <p className="text-[11px] text-[#6B7280]">{w.user_name || ''}</p>
              </td>
              <td className="px-5 py-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                  w.provider === 'esewa'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : w.provider === 'khalti'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {w.provider === 'esewa' ? 'eSewa' : w.provider === 'khalti' ? 'Khalti' : 'Stripe'}
                </span>
              </td>
              <td className="px-5 py-3 text-sm text-[#E5E7EB]">{w.account_identifier || '—'}</td>
              <td className="px-5 py-3 text-sm text-[#E5E7EB] text-right font-medium">{Number(w.coins).toLocaleString()}</td>
              <td className="px-5 py-3 text-sm text-amber-400 text-right">₨ {Number(w.platform_fee || 0).toLocaleString()}</td>
              <td className="px-5 py-3 text-sm text-emerald-400 text-right font-medium">₨ {Number(w.amount).toLocaleString()}</td>
              <td className="px-5 py-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${STATUS_CLASSES[w.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {Icon && <Icon className="w-3 h-3" />}
                  {w.status}
                </span>
              </td>
              <td className="px-5 py-3 text-xs text-[#6B7280]">{formatDateTime(w.created_at)}</td>
              <td className="px-5 py-3 text-center">
                {w.status === 'pending' ? (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleAction(w.id, 'approve')}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(w.id, 'reject')}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-[#4B5563]">—</span>
                )}
              </td>
            </tr>
          )
        })}
      </DataTable>
    </AdminPageLayout>
  )
}

export default AdminPayment
