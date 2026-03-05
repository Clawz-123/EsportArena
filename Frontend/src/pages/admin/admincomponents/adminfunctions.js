// Shared helpers for admin pages

export const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatDateTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatCurrency = (val) => {
  if (!val && val !== 0) return '—'
  return `₨ ${Number(val).toLocaleString()}`
}

export const roleBadgeClass = (role) => {
  const map = {
    Player: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    Organizer: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    SuperAdmin: 'bg-red-500/10 border-red-500/30 text-red-400',
  }
  return map[role] || 'bg-gray-500/10 border-gray-500/30 text-gray-400'
}

export const statusBadgeClass = (status) => {
  const map = {
    Ongoing: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    Registration: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    Completed: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
    Upcoming: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    Draft: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    'Reg. Closed': 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  }
  return map[status] || 'bg-gray-500/10 border-gray-500/30 text-gray-400'
}

export const getTournamentStatus = (t) => {
  if (t.is_draft) return 'Draft'
  const now = new Date()
  const regStart = new Date(t.registration_start)
  const regEnd = new Date(t.registration_end)
  const matchStart = new Date(t.match_start)
  const matchEnd = t.expected_end ? new Date(t.expected_end) : null

  if (now < regStart) return 'Upcoming'
  if (now >= regStart && now <= regEnd) return 'Registration'
  if (now > regEnd && now < matchStart) return 'Reg. Closed'
  if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'Ongoing'
  if (matchEnd && now > matchEnd) return 'Completed'
  return 'Unknown'
}
