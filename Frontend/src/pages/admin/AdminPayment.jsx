import React, { useEffect, useState, useRef } from 'react'
import AdminPageLayout from './admincomponents/PageLayout'
import DataTable from './admincomponents/DataTable'
import { formatDateTime } from './admincomponents/adminfunctions'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import axiosInstance from '../../axios/axiousinstance'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  X,
  Image,
  Eye,
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
  { label: 'Receipt' },
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
  const [approveModal, setApproveModal] = useState(null) // withdrawal object being approved
  const [rejectConfirm, setRejectConfirm] = useState(null) // withdrawal object being rejected
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [viewReceipt, setViewReceipt] = useState(null) // URL to view
  const fileInputRef = useRef(null)
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

  const handleAction = async (id, action, file) => {
    setActionLoading(id)
    try {
      if (action === 'approve' && file) {
        const formData = new FormData()
        formData.append('receipt_image', file)
        await axiosInstance.post(`/payment/admin/withdrawals/${id}/${action}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await axiosInstance.post(`/payment/admin/withdrawals/${id}/${action}/`)
      }
      toast.success(`Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      fetchWithdrawals()
    } catch (err) {
      toast.error(err.response?.data?.Error_Message || `Failed to ${action} withdrawal`)
    } finally { setActionLoading(null) }
  }

  const openApproveModal = (w) => {
    setApproveModal(w)
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const closeApproveModal = () => {
    setApproveModal(null)
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setReceiptFile(file)
    setReceiptPreview(URL.createObjectURL(file))
  }

  const handleConfirmApprove = async () => {
    if (!approveModal) return
    if (approveModal.provider !== 'stripe' && !receiptFile) {
      toast.error('Please upload a payment receipt screenshot')
      return
    }
    await handleAction(approveModal.id, 'approve', receiptFile)
    closeApproveModal()
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

  return (
    <AdminPageLayout title="Withdrawal Requests" subtitle={subtitle}>
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
              <td className="px-5 py-3">
                {w.receipt_image ? (
                  <button
                    onClick={() => setViewReceipt(w.receipt_image)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium hover:bg-blue-500/20 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View
                  </button>
                ) : (
                  <span className="text-xs text-[#4B5563]">—</span>
                )}
              </td>
              <td className="px-5 py-3 text-xs text-[#6B7280]">{formatDateTime(w.created_at)}</td>
              <td className="px-5 py-3 text-center">
                {w.status === 'pending' ? (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openApproveModal(w)}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setRejectConfirm(w)}
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

      {/* Approve Modal with Receipt Upload */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0F1724] border border-[#1F2937] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Approve Withdrawal</h3>
              <button onClick={closeApproveModal} className="text-[#6B7280] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">User</span>
                <span className="text-[#E5E7EB]">{approveModal.user_email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Provider</span>
                <span className="text-[#E5E7EB] capitalize">{approveModal.provider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Account</span>
                <span className="text-[#E5E7EB]">{approveModal.account_identifier || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Coins</span>
                <span className="text-[#E5E7EB] font-medium">{Number(approveModal.coins).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Payout Amount</span>
                <span className="text-emerald-400 font-medium">₨ {Number(approveModal.amount).toLocaleString()}</span>
              </div>
            </div>

            {approveModal.provider !== 'stripe' && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                  Payment Receipt Screenshot <span className="text-rose-400">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {receiptPreview ? (
                  <div className="relative group">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="w-full h-48 object-cover rounded-xl border border-[#1F2937]"
                    />
                    <button
                      onClick={() => { setReceiptFile(null); setReceiptPreview(null) }}
                      className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:bg-black transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-[#1F2937] hover:border-blue-500/40 text-[#6B7280] hover:text-blue-400 transition-colors"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Click to upload receipt screenshot</span>
                    <span className="text-xs text-[#4B5563]">PNG, JPG up to 5MB</span>
                  </button>
                )}
              </div>
            )}

            {approveModal.provider === 'stripe' && (
              <p className="text-sm text-[#6B7280] mb-5">
                Stripe withdrawals are processed automatically. No receipt needed.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeApproveModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1F2937] text-[#9CA3AF] text-sm font-medium hover:border-[#374151] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                disabled={actionLoading === approveModal.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading === approveModal.id ? 'Approving...' : 'Confirm Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Viewer */}
      {viewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewReceipt(null)}>
          <div className="relative max-w-2xl max-h-[80vh] p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewReceipt(null)}
              className="absolute -top-3 -right-3 z-10 p-1.5 bg-[#0F1724] border border-[#1F2937] rounded-full text-[#9CA3AF] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={viewReceipt}
              alt="Payment receipt"
              className="max-w-full max-h-[78vh] rounded-xl border border-[#1F2937] object-contain"
            />
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!rejectConfirm}
        title="Reject Withdrawal?"
        message={`Are you sure you want to reject this withdrawal request? The user will be notified and the amount will be credited back to their account.`}
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
        isLoading={actionLoading === rejectConfirm?.id}
        onConfirm={() => {
          if (rejectConfirm) {
            handleAction(rejectConfirm.id, 'reject');
            setRejectConfirm(null);
          }
        }}
        onCancel={() => setRejectConfirm(null)}
      />
    </AdminPageLayout>
  )
}

export default AdminPayment
