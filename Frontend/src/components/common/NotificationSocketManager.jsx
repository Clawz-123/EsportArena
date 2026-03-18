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

  const { isAuthenticated } = useSelector((state) => state.auth || {})

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setSocketConnected(false))
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      dispatch(setSocketConnected(false))
      return
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
    const wsBase = apiBase.replace(/^http/, 'ws').replace(/\/api\/?$/, '')
    const wsUrl = `${wsBase}/ws/notifications/?token=${encodeURIComponent(token)}`

    let manuallyClosed = false

    const connectSocket = () => {
      socketRef.current = new WebSocket(wsUrl)

      socketRef.current.onopen = () => {
        dispatch(setSocketConnected(true))
        dispatch(fetchNotifications())
      }

      socketRef.current.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)

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

    connectSocket()

    return () => {
      manuallyClosed = true
      dispatch(setSocketConnected(false))

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
      }

      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [dispatch, isAuthenticated])

  return null
}

export default NotificationSocketManager
