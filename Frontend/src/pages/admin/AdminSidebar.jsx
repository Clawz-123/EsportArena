import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Gamepad2,
  LayoutDashboard,
  CreditCard,
  Users,
  Trophy,
  LogOut,
} from 'lucide-react'
import { useAppDispatch } from '../../store/hooks'
import { logoutUser } from '../../slices/auth'

const items = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Withdrawals', to: '/admin/withdrawals', icon: CreditCard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Tournaments', to: '/admin/tournaments', icon: Trophy },
]

const SidebarItem = ({ to, label, Icon }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `relative flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all
      ${isActive
        ? 'bg-[#111827] text-blue-500'
        : 'text-slate-400 hover:bg-[#111827] hover:text-white'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 rounded-r bg-blue-500" />
        )}
        <Icon
          className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500'}`}
        />
        <span>{label}</span>
      </>
    )}
  </NavLink>
)

const AdminSidebar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/')
  }

  return (
    <aside className="w-64 min-h-screen bg-[#1E293B] border-r border-white/5 px-4 py-5 flex flex-col">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <Gamepad2 className="h-6 w-6 text-[#EC4899]" />
        <span className="text-xl font-bold text-[#EC4899]">Esports Arena</span>
      </Link>

      {/* Admin Badge */}
      <div className="mt-4 mb-2 px-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1">
        {items.map((item) => (
          <SidebarItem key={item.to} to={item.to} label={item.label} Icon={item.icon} />
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="relative flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-[#111827] hover:text-white transition-all"
      >
        <LogOut className="w-5 h-5 text-slate-500" />
        <span>Logout</span>
      </button>
    </aside>
  )
}

export default AdminSidebar
