import React, { useEffect, useState } from 'react'
import AdminPageLayout from './admincomponents/PageLayout'
import StatCardGrid from './admincomponents/StatCardGrid'
import SearchBar from './admincomponents/SearchBar'
import DataTable from './admincomponents/DataTable'
import Modal, { ModalCloseButton, ModalInfoRow } from './admincomponents/Modal'
import ConfirmModal from './admincomponents/ConfirmModal'
import UserAvatar from './admincomponents/UserAvatar'
import { formatDate, roleBadgeClass } from './admincomponents/adminfunctions'
import axiosInstance from '../../axios/axiousinstance'
import { Users, CheckCircle, Clock, Eye, Trash2, UserCheck, Shield } from 'lucide-react'

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'Player', label: 'Player' },
  { value: 'Organizer', label: 'Organizer' },
]

const TABLE_HEADERS = [
  { label: 'User' },
  { label: 'Role' },
  { label: 'Status' },
  { label: 'Phone' },
  { label: 'Joined' },
  { label: 'Actions', align: 'right' },
]

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewUser, setViewUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const perPage = 12

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await axiosInstance.get('/accounts/admin/users/')
        setUsers(res.data.Result?.users || [])
      } catch { setUsers([]) }
      finally { setLoading(false) }
    })()
  }, [])

  /* ── Derived stats ── */
  const totalPlayers = users.filter((u) => u.role === 'Player').length
  const totalOrganizers = users.filter((u) => u.role === 'Organizer').length
  const recentCount = users.filter((u) => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30)
    return new Date(u.date_joined) >= cutoff
  }).length

  const statCards = [
    { label: 'Total Users', value: users.length, icon: Users, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
    { label: 'Players', value: totalPlayers, icon: UserCheck, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    { label: 'Organizers', value: totalOrganizers, icon: Shield, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
    { label: 'New (30 days)', value: recentCount, icon: Clock, iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10' },
  ]

  /* ── Filtering & pagination ── */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchesSearch = (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q)
    return matchesSearch && (roleFilter === 'all' || u.role === roleFilter)
  })
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const resetPage = () => setCurrentPage(1)

  /* ── Delete ── */
  const handleDeleteUser = async (id) => {
    setDeleting(true)
    try {
      await axiosInstance.delete(`/accounts/admin/users/${id}/delete/`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setDeleteConfirm(null)
    } catch { /* silent */ }
    finally { setDeleting(false) }
  }

  return (
    <AdminPageLayout title="Users" subtitle="Manage all platform users">
      <StatCardGrid cards={statCards} />

      <SearchBar
        value={search}
        onChange={(e) => { setSearch(e.target.value); resetPage() }}
        placeholder="Search by name or email..."
        filterValue={roleFilter}
        onFilterChange={(e) => { setRoleFilter(e.target.value); resetPage() }}
        filterOptions={ROLE_FILTER_OPTIONS}
        resultCount={filtered.length}
      />

      <DataTable
        loading={loading}
        headers={TABLE_HEADERS}
        emptyIcon={Users}
        emptyText="No users found"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      >
        {paginated.map((u) => (
          <tr key={u.id} className="hover:bg-[#1F2937]/30 transition-colors">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <UserAvatar user={u} />
                <div>
                  <p className="text-sm text-[#E5E7EB] font-medium">{u.name || '—'}</p>
                  <p className="text-[11px] text-[#6B7280]">{u.email}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${roleBadgeClass(u.role)}`}>{u.role}</span>
            </td>
            <td className="px-5 py-3.5">
              {u.is_verified
                ? <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                : <span className="inline-flex items-center gap-1 text-[11px] text-amber-400"><Clock className="w-3.5 h-3.5" /> Pending</span>}
            </td>
            <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">{u.phone_number || '—'}</td>
            <td className="px-5 py-3.5 text-xs text-[#6B7280]">{formatDate(u.date_joined)}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => setViewUser(u)} className="p-1.5 rounded-lg text-[#6B7280] hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(u)} className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* View User Modal */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)}>
        {viewUser && (
          <>
            <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 pt-8 pb-12">
              <ModalCloseButton onClick={() => setViewUser(null)} />
            </div>
            <div className="flex justify-center -mt-10">
              <UserAvatar user={viewUser} size="lg" />
            </div>
            <div className="px-6 pb-6 pt-3 text-center">
              <h3 className="text-lg font-semibold text-[#E5E7EB]">{viewUser.name || '—'}</h3>
              <p className="text-sm text-[#6B7280] mb-4">{viewUser.email}</p>
              <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${roleBadgeClass(viewUser.role)}`}>{viewUser.role}</span>

              <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                <ModalInfoRow label="Phone">{viewUser.phone_number || '—'}</ModalInfoRow>
                <ModalInfoRow label="Status">
                  {viewUser.is_verified
                    ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                    : <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                </ModalInfoRow>
                <div className="col-span-2">
                  <ModalInfoRow label="Member Since">{formatDate(viewUser.date_joined)}</ModalInfoRow>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={() => setViewUser(null)} className="flex-1 px-4 py-2.5 rounded-lg bg-[#1F2937] text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors">Close</button>
                <button onClick={() => { setViewUser(null); setDeleteConfirm(viewUser) }} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400 hover:bg-red-500/20 transition-colors">Delete User</button>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeleteUser(deleteConfirm.id)}
        loading={deleting}
        title="Delete User"
        message="Are you sure you want to delete this user?"
      >
        {deleteConfirm && (
          <div className="flex items-center gap-2 bg-[#0F172A] rounded-lg p-3">
            <UserAvatar user={deleteConfirm} size="sm" />
            <div>
              <p className="text-sm text-[#E5E7EB] font-medium">{deleteConfirm.name || '—'}</p>
              <p className="text-[11px] text-[#6B7280]">{deleteConfirm.email}</p>
            </div>
          </div>
        )}
      </ConfirmModal>
    </AdminPageLayout>
  )
}

export default AdminUsers
