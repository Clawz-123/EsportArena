import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchMyJoinedTournaments } from '../../slices/tournamentSlice'
import PlayerSidebar from './PlayerSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { Trophy } from 'lucide-react'

const PlayerMyTournament = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [activeFilter, setActiveFilter] = useState('all')
    const { joinedTournaments, loading } = useAppSelector((state) => state.tournament)

    useEffect(() => {
        dispatch(fetchMyJoinedTournaments())
    }, [dispatch])

    // Get tournament status based on dates
    const getTournamentStatus = (tournament) => {
        if (!tournament) return 'unknown'
        const now = new Date()
        const regStart = new Date(tournament.registration_start)
        const regEnd = new Date(tournament.registration_end)
        const matchStart = new Date(tournament.match_start)
        const matchEnd = tournament.expected_end ? new Date(tournament.expected_end) : null

        if (now < regStart) return 'registration'
        if (now >= regStart && now <= regEnd) return 'registration'
        if (now > regEnd && now < matchStart) return 'registration'
        if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'ongoing'
        if (matchEnd && now > matchEnd) return 'completed'
        return 'upcoming'
    }

    // Format tournaments with status
    const tournaments = joinedTournaments.map((t) => ({
        ...t,
        status: getTournamentStatus(t),
    }))

    const filteredTournaments =
        activeFilter === 'all'
            ? tournaments
            : tournaments.filter((t) => t.status === activeFilter)

    const counts = {
        all: tournaments.length,
        ongoing: tournaments.filter((t) => t.status === 'ongoing').length,
        registration: tournaments.filter((t) => t.status === 'registration').length,
        completed: tournaments.filter((t) => t.status === 'completed').length,
    }

    const filters = [
        { key: 'all', label: 'All', count: counts.all },
        { key: 'ongoing', label: 'Ongoing', count: counts.ongoing },
        { key: 'registration', label: 'Registration', count: counts.registration },
        { key: 'completed', label: 'Completed', count: counts.completed },
    ]

    const getStatusStyle = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-[#3B82F6] text-white'
      case 'registration':
        return 'bg-[#020617] text-white border border-[#374151]'
      case 'completed':
        return 'bg-[#111827] text-[#E5E7EB] border border-[#374151]'
      case 'upcoming':
        return 'bg-[#1E293B] text-[#3B82F6]'
      default:
        return 'bg-[#111827] text-[#6B7280]'
    }
  }

    return (
        <div className="flex min-h-screen bg-[#0F172A]">
            {/* Sidebar */}
            <PlayerSidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6">
                    {/* Top Row – Profile */}
                    <div className="flex justify-end mb-6">
                        <ProfileMenu />
                    </div>

                    {/* Bottom Row – Title + Action */}
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
                                    All tournaments you have joined
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/tournaments')}
                            className="bg-[#3B82F6] hover:bg-[#2563EB] px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors"
                        >
                            Browse Tournaments
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="bg-[#1E293B] rounded-lg overflow-hidden">
                            {/* Filters */}
                            <div className="px-6 py-4 flex gap-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setActiveFilter(filter.key)}
                                        className={`px-4 py-2 text-[13px] font-semibold transition-colors ${
                                            activeFilter === filter.key
                                                ? 'text-white border-b-4 border-[#3B82F6]'
                                                : 'text-[#9CA3AF] hover:text-white hover:bg-[#111827]'
                                        }`}
                                    >
                                        {filter.label} ({filter.count})
                                    </button>
                                ))}
                            </div>

                            {/* Table */}
                            <div className="bg-[#1E293B]">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#111827]">
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
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-[13px] font-medium text-[#9CA3AF]">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center">
                                                    <p className="text-sm text-[#9CA3AF]">Loading tournaments...</p>
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
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize  ${getStatusStyle(
                                                                tournament.status
                                                            )}`}
                                                        >
                                                            {tournament.status}
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
                                                <td colSpan="5" className="px-6 py-8 text-center">
                                                    <p className="text-sm text-[#6B7280]">
                                                        No tournaments found.
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
