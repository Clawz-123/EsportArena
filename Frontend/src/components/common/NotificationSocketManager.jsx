import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  addRealtimeNotification,
  fetchNotifications,
  setSocketConnected,
} from '../../slices/notificationSlice'

const NotificationSocketManager = () => {
  const dispatch = useDispatch()
  const socketRef = useRef(null)
  const reconnectRef = useRef(null)
  const syncRef = useRef(null)

  const { isAuthenticated, token } = useSelector((state) => state.auth || {})

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setSocketConnected(false))
      return
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
    const wsBase = apiBase.replace(/^http/, 'ws').replace(/\/api\/?$/, '')

    let manuallyClosed = false

    const getWsUrl = () => {
      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) {
        return null
      }

      return `${wsBase}/ws/notifications/?token=${encodeURIComponent(accessToken)}`
    }

    const connectSocket = () => {
      const wsUrl = getWsUrl()
      if (!wsUrl) {
        dispatch(setSocketConnected(false))
        reconnectRef.current = setTimeout(connectSocket, 3000)
        return
      }

      socketRef.current = new WebSocket(wsUrl)

      socketRef.current.onopen = () => {
        dispatch(setSocketConnected(true))
        dispatch(fetchNotifications())
      }

      socketRef.current.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)

          if (payload?.event === 'connected') {
            dispatch(fetchNotifications())
          }

          if (payload?.event === 'new_notification' && payload?.data) {
            dispatch(addRealtimeNotification(payload.data))
          }
        } catch {
          // Ignore malformed message payloads
        }
      }

      socketRef.current.onclose = () => {
        dispatch(setSocketConnected(false))

        if (!manuallyClosed) {
          reconnectRef.current = setTimeout(connectSocket, 3000)
        }
      }
    }

    // Fallback sync for scenarios where websocket is blocked by network/proxy.
    syncRef.current = setInterval(() => {
      dispatch(fetchNotifications())
    }, 15000)

    connectSocket()

    return () => {
      manuallyClosed = true
      dispatch(setSocketConnected(false))

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
      }

      if (syncRef.current) {
        clearInterval(syncRef.current)
      }

      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [dispatch, isAuthenticated, token])

  return null
}

export default NotificationSocketManager
