import React, { useEffect, useState } from 'react'
import { ShieldAlert, Ban, Loader, UserX, Clock3 } from 'lucide-react'
import AdminPageLayout from './admincomponents/PageLayout'
import SearchBar from './admincomponents/SearchBar'
import DataTable from './admincomponents/DataTable'
import Modal, { ModalCloseButton } from './admincomponents/Modal'
import UserAvatar from './admincomponents/UserAvatar'
import axiosInstance from '../../axios/axiousinstance'
import { formatDateTime } from './admincomponents/adminfunctions'

const TABLE_HEADERS = [
  { label: 'Message' },
  { label: 'Sender' },
  { label: 'Reported By' },
  { label: 'Status' },
  { label: 'Date' },
  { label: 'Actions', align: 'right' },
]

const statusBadge = (status) => {
  const map = {
    open: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    reviewing: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    resolved: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  }
  return map[status] || 'bg-slate-500/10 border-slate-500/30 text-slate-300'
}

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [blockDuration, setBlockDuration] = useState('7d')
  const [useCustomUntil, setUseCustomUntil] = useState(false)
  const [customUntil, setCustomUntil] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await axiosInstance.get('/chat/admin/reports/')
        setReports(res.data.results || [])
      } catch {
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase()
    return (
      (r.message || '').toLowerCase().includes(q) ||
      (r.sender?.email || '').toLowerCase().includes(q) ||
      (r.reported_by?.email || '').toLowerCase().includes(q)
    )
  })

  const handleBlock = async (reportId) => {
    setActionLoading(true)
    try {
      const usingCustom = useCustomUntil && customUntil
      await axiosInstance.post(`/chat/admin/reports/${reportId}/block/`, {
        duration: usingCustom ? undefined : blockDuration,
        until: usingCustom ? customUntil : undefined,
        reason: 'Blocked by admin for toxic language.',
      })
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)))
      setSelected(null)
      setUseCustomUntil(false)
      setCustomUntil('')
    } catch {
      /* ignore */
    } finally {
      setActionLoading(false)
    }
  }

  const handleClose = () => {
    setSelected(null)
    setUseCustomUntil(false)
    setCustomUntil('')
  }

  const handleCancelReport = async (reportId) => {
    setActionLoading(true)
    try {
      await axiosInstance.post(`/chat/admin/reports/${reportId}/cancel/`)
      setReports((prev) => prev.filter((r) => r.id !== reportId))
      setSelected(null)
    } catch {
      /* ignore */
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AdminPageLayout title="Reported Messages" subtitle="Review and block users for abusive messages">
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by message or user email..."
        resultCount={filtered.length}
      />

      <div className="flex items-center flex-wrap justify-end gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs text-[#9CA3AF] bg-[#111827] px-3 py-2 rounded-lg border border-[#1F2937]">
          <Clock3 className="w-4 h-4" />
          <span>Block duration</span>
          <select
            value={blockDuration}
            onChange={(e) => setBlockDuration(e.target.value)}
            className="bg-transparent text-[#E5E7EB] border border-[#1F2937] rounded-md px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="1d">1 day</option>
            <option value="3d">3 days</option>
            <option value="7d">1 week</option>
            <option value="30d">1 month</option>
          </select>
        </div>
      </div>

      <DataTable
        loading={loading}
        headers={TABLE_HEADERS}
        emptyIcon={ShieldAlert}
        emptyText="No reports yet"
      >
        {filtered.map((r) => (
          <tr key={r.id} className="hover:bg-[#1F2937]/30 transition-colors">
            <td className="px-5 py-3.5">
              <div className="max-w-xs">
                <p className="text-sm text-[#E5E7EB] line-clamp-2">{r.message}</p>
                {r.reason ? <p className="text-[11px] text-amber-300 mt-1">Reason: {r.reason}</p> : null}
              </div>
            </td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-2">
                <UserAvatar user={{ name: r.sender?.name, email: r.sender?.email }} size="sm" />
                <div>
                  <p className="text-sm text-[#E5E7EB]">{r.sender?.name || '—'}</p>
                  <p className="text-[11px] text-[#6B7280]">{r.sender?.email || '—'}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5">
              <p className="text-sm text-[#E5E7EB]">{r.reported_by?.name || '—'}</p>
              <p className="text-[11px] text-[#6B7280]">{r.reported_by?.email || '—'}</p>
            </td>
            <td className="px-5 py-3.5">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge(r.status)}`}>
                {r.status}
              </span>
            </td>
            <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">{formatDateTime(r.created_at)}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelected(r)}
                  disabled={r.status === 'resolved' || actionLoading}
                  className={`p-1.5 rounded-lg transition-colors ${
                    r.status === 'resolved' ? 'text-[#374151] cursor-not-allowed' : 'text-red-400 hover:bg-red-500/10'
                  }`}
                  title="Block sender"
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={!!selected} onClose={handleClose}>
        {selected && (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#E5E7EB]">Reported Message</h3>
                <p className="text-sm text-[#D1D5DB] whitespace-pre-wrap mt-1">{selected.message}</p>
                {selected.reason ? <p className="text-xs text-amber-300 mt-2">Reason: {selected.reason}</p> : null}
              </div>
              <ModalCloseButton onClick={handleClose} />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#0F172A] p-4 rounded-lg border border-[#1F2937]">
              <div>
                <p className="text-[11px] text-[#6B7280] mb-1">Sender</p>
                <div className="flex items-center gap-2">
                  <UserAvatar user={{ name: selected.sender?.name, email: selected.sender?.email }} size="sm" />
                  <div>
                    <p className="text-sm text-[#E5E7EB]">{selected.sender?.name || '—'}</p>
                    <p className="text-[11px] text-[#6B7280]">{selected.sender?.email || '—'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7280] mb-1">Reported By</p>
                <p className="text-sm text-[#E5E7EB]">{selected.reported_by?.name || '—'}</p>
                <p className="text-[11px] text-[#6B7280]">{selected.reported_by?.email || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7280] mb-1">Status</p>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge(selected.status)}`}>
                  {selected.status}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7280] mb-1">Reported At</p>
                <p className="text-sm text-[#E5E7EB]">{formatDateTime(selected.created_at)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF] bg-[#111827] px-3 py-2 rounded-lg border border-[#1F2937]">
                  <Clock3 className="w-4 h-4" />
                  <span>Block duration</span>
                  <select
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(e.target.value)}
                    className="bg-transparent text-[#E5E7EB] border border-[#1F2937] rounded-md px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="1d">1 day</option>
                    <option value="3d">3 days</option>
                    <option value="7d">1 week</option>
                    <option value="30d">1 month</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF] bg-[#111827] px-3 py-2 rounded-lg border border-[#1F2937]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useCustomUntil}
                      onChange={(e) => setUseCustomUntil(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Custom unblock time</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={customUntil}
                    onChange={(e) => setCustomUntil(e.target.value)}
                    disabled={!useCustomUntil}
                    className="bg-transparent text-[#E5E7EB] border border-[#1F2937] rounded-md px-2 py-1 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-lg bg-[#1F2937] text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => selected && handleCancelReport(selected.id)}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
              >
                {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                Cancel Report
              </button>
              <button
                onClick={() => selected && handleBlock(selected.id)}
                disabled={selected?.status === 'resolved' || actionLoading}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                  selected?.status === 'resolved'
                    ? 'bg-[#1F2937] text-[#4B5563] cursor-not-allowed'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}
              >
                {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                Block Sender
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminPageLayout>
  )
}

export default AdminReports
