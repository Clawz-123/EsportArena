import React, { useEffect, useState } from 'react'

import AdminSidebar from './AdminSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import Pagination from '../../components/Pagination/Pagination'
import axiosInstance from '../../axios/axiousinstance'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-toastify'

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
    } catch {
      toast.error('Failed to load withdrawal requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const handleAction = async (id, action) => {
    setActionLoading(id)
    try {
      await axiosInstance.post(`/payment/admin/withdrawals/${id}/${action}/`)
      toast.success(`Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      fetchWithdrawals()
    } catch (err) {
      toast.error(err.response?.data?.Error_Message || `Failed to ${action} withdrawal`)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === 'all'
    ? withdrawals
    : withdrawals.filter((w) => w.status === filter)

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleFilterChange = (f) => {
    setFilter(f)
    setCurrentPage(1)
  }

  const statusStyle = (s) => {
    switch (s) {
      case 'pending':   return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'failed':    return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default:          return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length

  return (
    <div className="flex h-screen bg-[#0F172A]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">Withdrawal Requests</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Review and manage withdrawal requests
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[11px] font-semibold">
                  {pendingCount} pending
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchWithdrawals}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-[#1F2937] text-[#9CA3AF] text-sm hover:border-[#374151] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <ProfileMenu />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-350 mx-auto p-6 space-y-4">

            {/* Filter tabs */}
            <div className="flex gap-2">
              {['all', 'pending', 'completed', 'failed'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
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
                        <th className="px-5 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">User</th>
                        <th className="px-5 py-3 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Coins</th>
                        <th className="px-5 py-3 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Amount</th>
                        <th className="px-5 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Requested</th>
                        <th className="px-5 py-3 text-center text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                      {paginated.length > 0 ? (
                        paginated.map((w) => (
                          <tr key={w.id} className="hover:bg-[#1F2937]/30 transition-colors">
                            <td className="px-5 py-3">
                              <p className="text-sm text-[#E5E7EB] font-medium">{w.user_email || w.user}</p>
                              <p className="text-[11px] text-[#6B7280]">{w.user_name || ''}</p>
                            </td>
                            <td className="px-5 py-3 text-sm text-[#E5E7EB] text-right font-medium">
                              {Number(w.coins).toLocaleString()}
                            </td>
                            <td className="px-5 py-3 text-sm text-[#E5E7EB] text-right">
                              ₨ {Number(w.amount).toLocaleString()}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${statusStyle(w.status)}`}>
                                {w.status === 'pending' && <Clock className="w-3 h-3" />}
                                {w.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                {w.status === 'failed' && <XCircle className="w-3 h-3" />}
                                {w.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-[#6B7280]">
                              {formatDate(w.created_at)}
                            </td>
                            <td className="px-5 py-3 text-center">
                              {w.status === 'pending' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleAction(w.id, 'approve')}
                                    disabled={actionLoading === w.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleAction(w.id, 'reject')}
                                    disabled={actionLoading === w.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-[#4B5563]">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-5 py-12 text-center">
                            <CreditCard className="w-8 h-8 text-[#374151] mx-auto mb-2" />
                            <p className="text-sm text-[#6B7280]">
                              {filter === 'all' ? 'No withdrawal requests yet' : `No ${filter} withdrawals`}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPayment
