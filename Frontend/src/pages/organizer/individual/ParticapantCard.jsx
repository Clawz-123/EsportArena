import React, { useEffect, useMemo, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
    fetchTournamentTeams,
    clearTeams,
} from '../../../slices/tournamentSlice'

const ParticipantCard = ({ tournamentId }) => {
    const dispatch = useAppDispatch()
    const { teams, teamsLoading, teamsError, currentTournament } = useAppSelector((state) => state.tournament)

    const [selectedTeam, setSelectedTeam] = useState(null)
    const [searchTeam, setSearchTeam] = useState('')

    useEffect(() => {
        if (!tournamentId) return
        dispatch(fetchTournamentTeams(tournamentId))
        return () => {
            dispatch(clearTeams())
        }
    }, [dispatch, tournamentId])

    const filteredTeams = useMemo(() => {
        return (teams || [])
            .map((team) => {
                const captainFromMembers = team.members?.find((m) => m.is_captain)
                return {
                    id: team.id,
                    name: team.team_name || 'Unknown Team',
                    captain: team.captain_name || captainFromMembers?.player_name || 'N/A',
                    contact: team.captain_email || captainFromMembers?.player_email || 'N/A',
                    memberCount: team.member_count ?? team.members?.length ?? 0,
                    members: team.members || [],
                }
            })
            .filter((team) => {
                const query = searchTeam.toLowerCase()
                return (
                    team.name.toLowerCase().includes(query) ||
                    team.captain.toLowerCase().includes(query) ||
                    team.contact.toLowerCase().includes(query)
                )
            })
    }, [teams, searchTeam])

    const openModal = (team) => {
        setSelectedTeam(team)
    }

    const closeModal = () => {
        setSelectedTeam(null)
    }

    return (
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-semibold text-white">Registered Teams</h2>
                    <span className="text-sm text-[#9CA3AF]">
                        {teams?.length || 0}/{currentTournament?.max_participants || 0}
                    </span>
                </div>
                <p className="text-[#9CA3AF] text-sm mb-4">
                    Manage team registrations and approvals
                </p>

                {/* Search and Filter */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchTeam}
                            onChange={(e) => setSearchTeam(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#1E293B] border border-[#2D3748] rounded-md text-white placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6]"
                        />
                    </div>
                </div>

                {/* Teams Table */}
                <div className="bg-[#1E293B] rounded-lg border border-[#2D3748] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#2D3748]">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">
                                    Team Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">
                                    Captain
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">
                                    Members
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamsLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-[#9CA3AF]">
                                        Loading teams...
                                    </td>
                                </tr>
                            ) : teamsError ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-[#EF4444]">
                                        Failed to load teams.
                                    </td>
                                </tr>
                            ) : filteredTeams.length > 0 ? (
                                filteredTeams.map((team) => (
                                    <tr
                                        key={team.id}
                                        className="border-b border-[#2D3748] last:border-0 hover:bg-[#2D3748]/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {team.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                                            {team.captain}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                                            {team.memberCount}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                                            {team.contact}
                                        </td>
                                        <td className="px-10 py-4">
                                            <button
                                                onClick={() => openModal(team)}
                                                className=" rounded-md text-[#9CA3AF] hover:text-[#3B82F6] transition-colors cursor-pointer"
                                                aria-label="View team"
                                            >

                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">
                                        <p className="text-[#6B7280] text-sm">
                                            No teams found.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Modal for Team Details */}
                {selectedTeam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
                        <div className="w-full max-w-3xl bg-[#0F172A] border border-[#1F2937] rounded-2xl shadow-2xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
                                <div>
                                    <p className="text-sm text-[#9CA3AF]">Team</p>
                                    <h3 className="text-2xl font-semibold text-white">{selectedTeam.name}</h3>
                                    <p className="text-xs text-[#9CA3AF] mt-1">Captain: {selectedTeam.captain}</p>
                                    <p className="text-xs text-[#9CA3AF]">Contact: {selectedTeam.contact}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-[#9CA3AF] hover:text-white px-3 py-2 rounded-md hover:bg-[#1E293B] transition-colors"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="overflow-x-auto rounded-lg border border-[#1F2937]">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-[#1E293B] text-[#9CA3AF] uppercase text-xs">
                                                <th className="px-4 py-3 text-left">Player</th>
                                                <th className="px-4 py-3 text-left">In-Game Name</th>
                                                <th className="px-4 py-3 text-left">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedTeam.members.length > 0 ? (
                                                selectedTeam.members.map((member) => (
                                                    <tr
                                                        key={member.id}
                                                        className="border-t border-[#1F2937] hover:bg-[#1E293B]/60"
                                                    >
                                                        <td className="px-4 py-3 text-white">{member.player_name || 'Unknown'}</td>
                                                        <td className="px-4 py-3 text-[#9CA3AF]">{member.in_game_name || 'N/A'}</td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${member.is_captain
                                                                    ? 'bg-[#10B981] text-white'
                                                                    : 'bg-[#2D3748] text-[#9CA3AF]'
                                                                    }`}
                                                            >
                                                                {member.is_captain ? 'Captain' : 'Member'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-6 text-center text-[#9CA3AF]">
                                                        No players added.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ParticipantCard
