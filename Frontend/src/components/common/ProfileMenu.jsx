import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../slices/auth'
import { fetchUserProfile } from '../../slices/viewprofile'

const ProfileMenu = () => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.auth || {})
  const { profile } = useSelector((state) => state.profile || {})

  const getInitials = (u, p) => {
    if (!u && !p) return "U"
    const name = p?.username || p?.organizer_name || p?.email || u?.name || u?.email || "User"
    const parts = String(name).trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0]?.[0] || ""}${parts[parts.length - 1]?.[0] || ""}`.toUpperCase() || "U"
  }

  const getDisplayName = (u, p) => {
    if (p) return p.username || p.organizer_name || p.email || "User"
    if (u) return u.name || u.email || "User"
    return "User"
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser())
    } finally {
      setShowUserMenu(false)
      navigate("/")
    }
  }

  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        showUserMenu &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [showUserMenu])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowUserMenu((v) => !v)}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="User menu"
      >
        {profile?.profile_image ? (
          <img
            src={profile.profile_image}
            alt={getDisplayName(user, profile)}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {getInitials(user, profile)}
          </div>
        )}
      </button>
      {showUserMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 rounded-md bg-[#0a0e1a] border border-slate-800 shadow-xl overflow-hidden z-50"
        >
          <div className="px-3 py-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {profile?.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={getDisplayName(user, profile)}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                  {getInitials(user, profile)}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm text-white truncate">
                  {getDisplayName(user, profile)}
                </div>
              </div>
            </div>
          </div>
          <ul className="py-1">
            <li>
              <button
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => {
                  setShowUserMenu(false)
                  navigate("/view-profile")
                }}
              >
                View Profile
              </button>
            </li>
            <li className="border-t border-slate-800" />
            <li>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu
