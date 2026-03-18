import React, { useState, useRef, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, Trophy, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../slices/notificationSlice'

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

const NotificationIcon = ({ type, icon }) => {
  const iconClass = 'w-5 h-5'

  switch (icon || type) {
    case 'trophy':
    case 'tournament':
    case 'tournament_invite':
      return <Trophy className={`${iconClass} text-yellow-500`} />
    case 'check':
    case 'payment':
    case 'payment_success':
      return <CheckCircle className={`${iconClass} text-green-500`} />
    case 'alert':
    case 'system':
    case 'tournament_alert':
      return <AlertCircle className={`${iconClass} text-red-500`} />
    case 'info':
    case 'result':
    case 'match_result':
      return <Info className={`${iconClass} text-blue-500`} />
    default:
      return <Bell className={`${iconClass} text-slate-400`} />
  }
}

const NotificationItem = ({ notification, onDelete, onMarkRead }) => {
  return (
    <div
      className={`px-4 py-3 border-b border-slate-800 hover:bg-slate-900/50 transition-colors cursor-pointer group ${
        !notification.is_read ? 'bg-slate-900/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0">
          <NotificationIcon
            type={notification.notification_type || notification.type}
            icon={notification.icon}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{notification.title}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notification.message || notification.description}</p>
              <p className="text-xs text-slate-500 mt-2">{formatNotificationTime(notification)}</p>
            </div>

            <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                  title="Mark as read"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {!notification.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
      </div>
    </div>
  )
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth || {})
  const { items: notifications = [], unreadCount = 0 } = useSelector((state) => state.notifications || {})

  const notificationsPath = user?.is_organizer ? '/organizer/notifications' : '/player/notifications'

  const handleDelete = (id) => {
    dispatch(deleteNotification(id))
  }

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id))
  }

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead())
  }

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 rounded-lg bg-[#0a0e1a] border border-slate-800 shadow-2xl overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="text-xs text-blue-400 hover:text-blue-300 disabled:text-slate-500 font-medium transition-colors"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDelete={handleDelete}
                  onMarkRead={handleMarkRead}
                />
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-slate-400">No notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/20">
              <Link
                to={notificationsPath}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors py-2"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
