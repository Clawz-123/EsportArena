import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchMyJoinedTournaments } from '../../slices/tournamentSlice'
import PlayerSidebar from './PlayerSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { ChevronDown, Search, Trophy } from 'lucide-react'

const PlayerMyTournament = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedGame, setSelectedGame] = useState('All Games')
    const [selectedStatus, setSelectedStatus] = useState('All Status')
    const { joinedTournaments, joinedLoading, joinedError } = useAppSelector((state) => state.tournament)

    useEffect(() => {
        dispatch(fetchMyJoinedTournaments())
    }, [dispatch])

    // Get tournament status using backend status first, then date fallback
    const getTournamentStatus = (tournament) => {
        if (!tournament) return 'unknown'

        const explicitStatus = String(tournament.status || '').toLowerCase()
        if (explicitStatus === 'active') return 'ongoing'
        if (explicitStatus === 'completed') return 'completed'
        if (explicitStatus === 'registration closed') return 'registration-closed'
        if (explicitStatus === 'registration open') return 'registration'

        const now = new Date()
        const regStart = new Date(tournament.registration_start)
        const regEnd = new Date(tournament.registration_end)
        const matchStart = new Date(tournament.match_start)
        const matchEnd = tournament.expected_end ? new Date(tournament.expected_end) : null

        if (Number.isNaN(regStart.getTime()) || Number.isNaN(regEnd.getTime()) || Number.isNaN(matchStart.getTime())) {
            return 'unknown'
        }

        if (now < regStart) return 'upcoming'
        if (now >= regStart && now <= regEnd) return 'registration'
        if (now > regEnd && now < matchStart) return 'registration-closed'
        if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'ongoing'
        if (matchEnd && now > matchEnd) return 'completed'
        return 'unknown'
    }

    const getRegistrationStatus = (tournament) => {
        const explicitStatus = String(tournament?.status || '').toLowerCase()
        if (explicitStatus === 'registration open') return 'Open'
        if (['registration closed', 'active', 'completed'].includes(explicitStatus)) return 'Closed'

        const now = new Date()
        const regStart = new Date(tournament.registration_start)
        const regEnd = new Date(tournament.registration_end)

        if (Number.isNaN(regStart.getTime()) || Number.isNaN(regEnd.getTime())) {
            return 'Closed'
        }

        if (now >= regStart && now <= regEnd) return 'Open'
        return 'Closed'
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ongoing':
                return 'Ongoing'
            case 'registration':
                return 'Registration'
            case 'registration-closed':
                return 'Registration Closed'
            case 'completed':
                return 'Completed'
            case 'upcoming':
                return 'Upcoming'
            default:
                return 'Unknown'
        }
    }

    const games = ['All Games', 'PUBG Mobile', 'Free Fire']
    const statuses = [
        'All Status',
        'Ongoing',
        'Registration',
        'Registration Closed',
        'Upcoming',
        'Completed',
    ]

    // Normalize joined tournaments for UI rendering and filtering
    const tournaments = joinedTournaments.map((t) => ({
        ...t,
        status: getTournamentStatus(t),
        statusLabel: getStatusLabel(getTournamentStatus(t)),
        registrationLabel: getRegistrationStatus(t),
    }))

    const filteredTournaments = tournaments.filter((tournament) => {
        const matchesSearch = (tournament.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesGame = selectedGame === 'All Games' || tournament.game_title === selectedGame
        const matchesStatus = selectedStatus === 'All Status' || tournament.statusLabel === selectedStatus
        return matchesSearch && matchesGame && matchesStatus
    })

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ongoing':
                return 'border-[#00E5A8] text-[#00E5A8] bg-[#00E5A8]/10'
            case 'registration':
                return 'border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6]/10'
            case 'registration-closed':
                return 'border-[#FF4D4F] text-[#FF4D4F] bg-[#FF4D4F]/10'
            case 'completed':
                return 'border-[#9CA3AF] text-[#E5E7EB] bg-[#9CA3AF]/10'
            case 'upcoming':
                return 'border-[#60A5FA] text-[#60A5FA] bg-[#60A5FA]/10'
            default:
                return 'border-[#6B7280] text-[#9CA3AF] bg-[#6B7280]/10'
        }
    }

    return (
        <div className="flex min-h-screen bg-[#0F172A]">
            {/* Sidebar */}
            <PlayerSidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Trophy
                                className="w-6 h-6 text-[#3B82F6]"
                                strokeWidth={1.5}
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-[#E5E7EB]">
                                    My Tournaments
                                </h1>
                                <p className="text-sm text-[#9CA3AF] mt-1">
                                    Manage and track all tournaments you joined
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/tournaments')}
                            className="bg-[#3B82F6] hover:bg-[#2563EB] px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors"
                        >
                            Browse Tournaments
                        </button>

                        <ProfileMenu />
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-300 mx-auto p-6 space-y-6">
                        {/* Search & Filter Bar */}
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" strokeWidth={1.5} />
                                <input
                                    type="text"
                                    placeholder="Search tournaments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#111827] border border-[#1F2937] rounded-md pl-10 pr-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedGame}
                                    onChange={(e) => setSelectedGame(e.target.value)}
                                    className="appearance-none bg-[#111827] border border-[#1F2937] rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
                                >
                                    {games.map((game) => (
                                        <option key={game} value={game}>
                                            {game}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" strokeWidth={1.5} />
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="appearance-none bg-[#111827] border border-[#1F2937] rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Table */}
                        <div>
                            <h2 className="text-base font-semibold text-[#E5E7EB] mb-4">
                                Tournaments ({filteredTournaments.length})
                            </h2>

                            <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#1F2937]">
                                            <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                                                Game
                                            </th>
                                            <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                                                Format
                                            </th>
                                            <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                                                Registration
                                            </th>
                                            <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-[13px] font-medium text-[#9CA3AF]">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {joinedLoading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center">
                                                    <p className="text-sm text-[#9CA3AF]">Loading tournaments...</p>
                                                </td>
                                            </tr>
                                        ) : joinedError ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center">
                                                    <p className="text-sm text-red-400">Failed to load tournaments. Please try again.</p>
                                                </td>
                                            </tr>
                                        ) : filteredTournaments.length > 0 ? (
                                            filteredTournaments.map((tournament) => (
                                                <tr
                                                    key={tournament.id}
                                                    className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937]/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium text-[#E5E7EB]">
                                                        {tournament.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                                                        {tournament.game_title || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                                                        {tournament.match_format || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                                                        {tournament.registrationLabel}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center justify-center min-w-32 px-4 py-1 rounded-full text-sm font-semibold border ${getStatusStyle(
                                                                tournament.status
                                                            )}`}
                                                        >
                                                            {tournament.statusLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/tournaments/${tournament.id}`
                                                                )
                                                            }
                                                            className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center">
                                                    <p className="text-sm text-[#6B7280]">
                                                        {searchQuery || selectedGame !== 'All Games' || selectedStatus !== 'All Status'
                                                            ? 'No tournaments found matching your search criteria.'
                                                            : 'No tournaments joined yet.'}
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerMyTournament
