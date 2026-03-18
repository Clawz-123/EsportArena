const normalizeType = (notification) =>
  String(
    notification?.notification_type ||
      notification?.type ||
      notification?.icon ||
      ''
  ).toLowerCase()

const hasAny = (value, terms) => terms.some((term) => value.includes(term))

export const resolveNotificationPath = (notification, user) => {
  const type = normalizeType(notification)
  const metadata = notification?.metadata || {}

  if (typeof metadata.url === 'string' && metadata.url.trim()) {
    return metadata.url
  }

  const tournamentId = metadata.tournament_id || metadata.tournamentId || null
  const isAdmin = user?.role === 'SuperAdmin'
  const isOrganizer = !!user?.is_organizer

  const isPayment = hasAny(type, ['payment', 'withdraw']) || !!metadata.order_id || !!metadata.withdrawal_id
  const isResult = hasAny(type, ['result']) || !!metadata.result_id
  const isTournamentFlow =
    hasAny(type, ['tournament', 'match', 'bracket']) ||
    !!tournamentId ||
    !!metadata.match_id

  if (isAdmin) {
    if (isPayment) return '/admin/withdrawals'
    if (isTournamentFlow || isResult) return '/admin/tournaments'
    return '/admin/dashboard'
  }

  if (isOrganizer) {
    if (isPayment) return '/OrgWallet'
    if (isResult) return '/OrgResultVerification'
    if (tournamentId) return `/organizer/tournaments/${tournamentId}`
    if (isTournamentFlow) return '/Orgtournaments'
    return '/OrgDashboard'
  }

  // Default player navigation.
  if (isPayment) return '/PlayerWalletandEarning'
  if (tournamentId) return `/tournaments/${tournamentId}`
  if (isTournamentFlow || isResult) return '/PlayerMyTournament'
  return '/PlayerDashboard'
}
