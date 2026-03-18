import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Trophy,
  Trash2,
  Clock,
  CheckCheck,
  BellOff,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../slices/notificationSlice'
import PlayerSidebar from './PlayerSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { resolveNotificationPath } from '../../utils/notificationNavigation'

const formatNotificationTime = (notification) => {
  if (notification?.timestamp) return notification.timestamp
  if (!notification?.created_at) return 'Just now'

  const created = new Date(notification.created_at)
  if (Number.isNaN(created.getTime())) return 'Just now'

  const diffSeconds = Math.floor((Date.now() - created.getTime()) / 1000)
  if (diffSeconds < 60) return 'Just now'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`
  return `${Math.floor(diffSeconds / 86400)} days ago`
}

const iconConfig = {
  trophy: {
    Icon: Trophy,
    bg: 'bg-amber-500/10',
    color: 'text-amber-400',
  },
  tournament_invite: {
    Icon: Trophy,
    bg: 'bg-amber-500/10',
    color: 'text-amber-400',
  },
  tournament: {
    Icon: Trophy,
    bg: 'bg-amber-500/10',
    color: 'text-amber-400',
  },
  check: {
    Icon: CheckCircle,
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-400',
  },
  payment_success: {
    Icon: CheckCircle,
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-400',
  },
  payment: {
    Icon: CheckCircle,
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-400',
  },
  alert: {
    Icon: AlertCircle,
    bg: 'bg-rose-500/10',
    color: 'text-rose-400',
  },
  tournament_alert: {
    Icon: AlertCircle,
    bg: 'bg-rose-500/10',
    color: 'text-rose-400',
  },
  payment_pending: {
    Icon: AlertCircle,
    bg: 'bg-rose-500/10',
    color: 'text-rose-400',
  },
  info: {
    Icon: Info,
    bg: 'bg-blue-500/10',
    color: 'text-blue-400',
  },
  match_result: {
    Icon: Info,
    bg: 'bg-blue-500/10',
    color: 'text-blue-400',
  },
  result: {
    Icon: Info,
    bg: 'bg-blue-500/10',
    color: 'text-blue-400',
  },
  system: {
    Icon: AlertCircle,
    bg: 'bg-rose-500/10',
    color: 'text-rose-400',
  },
}

const fallbackIcon = {
  Icon: Bell,
  bg: 'bg-slate-500/10',
  color: 'text-slate-400',
}

const NotificationCard = ({ notification, onDelete, onMarkRead, onOpen }) => {
  const cfg =
    iconConfig[notification.icon] ||
    iconConfig[notification.notification_type] ||
    iconConfig[notification.type] ||
    fallbackIcon
  const IconComp = cfg.Icon

  return (
    <div
      onClick={() => onOpen(notification)}
      className={`group relative flex items-start gap-4 px-5 py-4 transition-all duration-200 hover:bg-[#1E293B]/60 ${
        !notification.is_read
          ? 'border-l-[3px] border-l-blue-500 bg-blue-500/3'
          : 'border-l-[3px] border-l-transparent'
      }`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
      >
        <IconComp className={`h-5 w-5 ${cfg.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4
            className={`text-sm font-semibold ${
              !notification.is_read ? 'text-white' : 'text-[#CBD5E1]'
            }`}
          >
            {notification.title}
          </h4>
          {!notification.is_read && (
            <span className="inline-flex h-4.5 items-center rounded-full bg-blue-500/15 px-2 text-[10px] font-bold uppercase tracking-wide text-blue-400">
              New
            </span>
          )}
        </div>
        <p className="text-[13px] leading-relaxed text-[#94A3B8]">
          {notification.message || notification.description}
        </p>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#64748B]">
          <Clock className="h-3 w-3" />
          {formatNotificationTime(notification)}
        </span>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!notification.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead(notification.id)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#64748B] hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
            title="Mark as read"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#64748B] hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
]

const Notifications = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [filter, setFilter] = useState('all')
  const { items: notifications = [], unreadCount = 0, loading } = useSelector(
    (state) => state.notifications || {}
  )
  const { user } = useSelector((state) => state.auth || {})

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  const countFor = (key) => {
    if (key === 'all') return notifications.length
    if (key === 'unread') return unreadCount
    return notifications.length - unreadCount
  }

  const handleDelete = (id) =>
    dispatch(deleteNotification(id))

  const handleMarkRead = (id) =>
    dispatch(markNotificationRead(id))

  const handleMarkAllRead = () =>
    dispatch(markAllNotificationsRead())

  const handleOpenNotification = (notification) => {
    const path = resolveNotificationPath(notification, user)

    if (!notification?.is_read) {
      dispatch(markNotificationRead(notification.id))
    }

    if (path) {
      navigate(path)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <PlayerSidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">
              Notifications
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Stay updated on your gaming activity
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 rounded-md border border-[#1F2937] bg-[#111827] px-3.5 py-2 text-sm font-medium text-[#94A3B8] hover:border-blue-500/40 hover:text-blue-400 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
            <ProfileMenu />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-8 py-6 space-y-5">
            {/* Unread summary + filter tabs */}
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex items-center rounded-lg bg-[#111827] p-1 border border-[#1F2937]">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`relative rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                      filter === tab.key
                        ? 'bg-[#1E293B] text-white shadow-sm'
                        : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-1.5 text-xs ${
                        filter === tab.key
                          ? 'text-[#94A3B8]'
                          : 'text-[#475569]'
                      }`}
                    >
                      {countFor(tab.key)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Unread indicator */}
              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Notification list */}
            <div className="min-h-[calc(100vh-250px)] rounded-xl border border-[#1F2937] bg-[#111827] overflow-hidden divide-y divide-[#1E293B]">
              {loading ? (
                <div className="px-6 py-10 text-sm text-[#94A3B8]">Loading notifications...</div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onDelete={handleDelete}
                    onMarkRead={handleMarkRead}
                    onOpen={handleOpenNotification}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E293B] mb-4">
                    <BellOff className="h-7 w-7 text-[#475569]" />
                  </div>
                  <p className="text-[15px] font-medium text-[#64748B]">
                    No notifications found
                  </p>
                  <p className="mt-1 text-sm text-[#475569]">
                    {filter !== 'all'
                      ? 'Try switching to a different filter'
                      : "You're all caught up!"}
                  </p>
                  {filter !== 'all' && (
                    <button
                      onClick={() => setFilter('all')}
                      className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View all notifications
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
