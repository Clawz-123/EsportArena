import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
    Gamepad2,
    LayoutDashboard,
    Trophy,
    PlusCircle,
    CheckCircle,
    Wallet,
    Bell,
} from 'lucide-react'

const items = [
    { label: 'Dashboard', to: '/OrgDashboard', icon: LayoutDashboard },
    { label: 'My Tournaments', to: '/Orgtournaments', icon: Trophy },
    { label: 'Create Tournament', to: '/OrgCreateTournament', icon: PlusCircle },
    { label: 'Result Verification', to: '/OrgResultVerification', icon: CheckCircle },
    { label: 'Wallet & Earnings', to: '/OrgWallet', icon: Wallet },
    { label: 'Notifications', to: '/organizer/notifications', icon: Bell },
]

const SidebarItem = ({ to, label, Icon }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) =>
            `
      relative flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all
      ${isActive
                ? 'bg-[#111827] text-blue-500'
                : 'text-slate-400 hover:bg-[#111827] hover:text-white'
            }
      `
        }
    >
        {({ isActive }) => (
            <>
                {/* Active left indicator */}
                {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 rounded-r bg-blue-500" />
                )}

                <Icon
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500'
                        }`}
                />
                <span>{label}</span>
            </>
        )}
    </NavLink>
)

const OrgSidebar = () => {
    return (
        <aside className="w-64 min-h-screen bg-[#1E293B] border-r border-white/5 px-4 py-5">
            <Link to="/" className="flex items-center gap-2">
                <Gamepad2 className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-pink-500">
                    Esports Arena
                </span>
            </Link>

            {/* Navigation */}
            <nav className="mt-8 space-y-1">
                {items.map((item) => (
                    <SidebarItem
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        Icon={item.icon}
                    />
                ))}
            </nav>
        </aside>
    )
}

export default OrgSidebar
