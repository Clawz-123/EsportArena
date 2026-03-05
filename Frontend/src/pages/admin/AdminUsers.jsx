import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import Pagination from '../../components/Pagination/Pagination'
import axiosInstance from '../../axios/axiousinstance'
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  Eye,
  Trash2,
  UserCheck,
  Shield,
  X,
} from 'lucide-react'

const AdminUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewUser, setViewUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const perPage = 12

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/accounts/admin/users/')
      setUsers(res.data.Result?.users || [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Stats
  const totalUsers = users.length
  const totalPlayers = users.filter((u) => u.role === 'Player').length
  const totalOrganizers = users.filter((u) => u.role === 'Organizer').length
  const recentUsers = users.filter((u) => {
    const joined = new Date(u.date_joined)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return joined >= thirtyDaysAgo
  }).length

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Players',
      value: totalPlayers,
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Organizers',
      value: totalOrganizers,
      icon: Shield,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      label: 'New (30 days)',
      value: recentUsers,
      icon: Clock,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
    },
  ]

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (u.email || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q)
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleDeleteUser = async (userId) => {
    setDeleting(true)
    try {
      await axiosInstance.delete(`/accounts/admin/users/${userId}/delete/`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setDeleteConfirm(null)
    } catch {
      // silent fail
    } finally {
      setDeleting(false)
    }
  }

  const roleBadge = (role) => {
    const map = {
      Player: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      Organizer: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      SuperAdmin: 'bg-red-500/10 border-red-500/30 text-red-400',
    }
    return map[role] || 'bg-gray-500/10 border-gray-500/30 text-gray-400'
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex h-screen bg-[#0F172A]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">Users</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Manage all platform users</p>
          </div>
          <ProfileMenu />
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-350 mx-auto p-6 space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#111827] border border-[#1F2937] rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                      <card.icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={1.8} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                  <p className="text-xs text-[#6B7280] font-medium">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Search + Role Filter */}
            <div className="flex items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-blue-500/40"
                />
              </div>
              <select
                value={roleFilter}
                onChange={handleRoleFilter}
                className="px-4 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#E5E7EB] focus:outline-none focus:border-blue-500/40 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="Player">Player</option>
                <option value="Organizer">Organizer</option>
              </select>
              <span className="text-xs text-[#6B7280]">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
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
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">User</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Role</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Phone</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Joined</th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                      {paginated.length > 0 ? (
                        paginated.map((u) => (
                          <tr key={u.id} className="hover:bg-[#1F2937]/30 transition-colors group">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                {u.profile_image ? (
                                  <img
                                    src={u.profile_image}
                                    alt={u.name}
                                    className="w-9 h-9 rounded-full object-cover border border-[#1F2937] shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-[#1F2937] flex items-center justify-center text-xs font-bold text-[#9CA3AF] shrink-0 border border-[#374151]">
                                    {(u.name || u.email || '?')[0].toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm text-[#E5E7EB] font-medium">{u.name || '—'}</p>
                                  <p className="text-[11px] text-[#6B7280]">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${roleBadge(u.role)}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {u.is_verified ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                                  <Clock className="w-3.5 h-3.5" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">
                              {u.phone_number || '—'}
                            </td>
                            <td className="px-5 py-3.5 text-xs text-[#6B7280]">
                              {formatDate(u.date_joined)}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setViewUser(u)}
                                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                  title="View user"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(u)}
                                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-5 py-12 text-center">
                            <Users className="w-8 h-8 text-[#374151] mx-auto mb-2" />
                            <p className="text-sm text-[#6B7280]">No users found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewUser(null)}>
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 pt-8 pb-12">
              <button onClick={() => setViewUser(null)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#1F2937]/60 text-[#9CA3AF] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Avatar */}
            <div className="flex justify-center -mt-10">
              {viewUser.profile_image ? (
                <img
                  src={viewUser.profile_image}
                  alt={viewUser.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#111827]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1F2937] flex items-center justify-center text-2xl font-bold text-[#9CA3AF] border-4 border-[#111827]">
                  {(viewUser.name || viewUser.email || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            {/* Details */}
            <div className="px-6 pb-6 pt-3 text-center">
              <h3 className="text-lg font-semibold text-[#E5E7EB]">{viewUser.name || '—'}</h3>
              <p className="text-sm text-[#6B7280] mb-4">{viewUser.email}</p>
              <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${roleBadge(viewUser.role)}`}>
                {viewUser.role}
              </span>

              <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                <div className="bg-[#0F172A] rounded-lg p-3">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm text-[#E5E7EB]">{viewUser.phone_number || '—'}</p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-3">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm">
                    {viewUser.is_verified ? (
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>
                    )}
                  </p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-3 col-span-2">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-sm text-[#E5E7EB]">{formatDate(viewUser.date_joined)}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setViewUser(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#1F2937] text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => { setViewUser(null); setDeleteConfirm(viewUser) }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-[#E5E7EB] font-semibold">Delete User</h3>
                <p className="text-xs text-[#6B7280]">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-[#9CA3AF] mb-1">
              Are you sure you want to delete this user?
            </p>
            <div className="flex items-center gap-2 bg-[#0F172A] rounded-lg p-3 mb-5">
              {deleteConfirm.profile_image ? (
                <img src={deleteConfirm.profile_image} alt="" className="w-8 h-8 rounded-full object-cover border border-[#1F2937]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-xs font-bold text-[#9CA3AF]">
                  {(deleteConfirm.name || deleteConfirm.email || '?')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm text-[#E5E7EB] font-medium">{deleteConfirm.name || '—'}</p>
                <p className="text-[11px] text-[#6B7280]">{deleteConfirm.email}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#1F2937] text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm.id)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-sm text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
