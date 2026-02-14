import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OrgSidebar from './OrgSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { Plus, Search, Trophy, ChevronDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchOrganizerTournaments, clearError } from '../../slices/tournamentSlice'

const OrgTournaments = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState('All Games')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const { tournaments, loading, error } = useAppSelector((state) => state.tournament)

  const games = ['All Games', 'PUBG Mobile', 'Free Fire']
  const statuses = ['All Status', 'Ongoing', 'Registration', 'Draft', 'Completed']

  // Fetching the organizer's tournaments when the component mounts and clearing any errors when it unmounts
  useEffect(() => {
    dispatch(fetchOrganizerTournaments())
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Logging the tournaments, loading state, and error state for debugging purposes whenever they change
  useEffect(() => {
    console.log("Tournaments in Redux:", tournaments);
    console.log("Loading:", loading);
    console.log("Error:", error);
  }, [tournaments, loading, error])

  // Created helper function to determine the tournament status
  const getTournamentStatus = (tournament) => {
    if (tournament.is_draft) return 'Draft'
    const now = new Date()
    const regStart = new Date(tournament.registration_start)
    const regEnd = new Date(tournament.registration_end)
    const matchStart = new Date(tournament.match_start)
    const matchEnd = tournament.expected_end ? new Date(tournament.expected_end) : null

    // Determining the tournament status based on the current date and the tournament's registration and match dates
    if (now < regStart) return 'Upcoming'
    if (now >= regStart && now <= regEnd) return 'Registration'
    if (now > regEnd && now < matchStart) return 'Registration Closed'
    if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'Ongoing'
    if (matchEnd && now > matchEnd) return 'Completed'
    return 'Unknown'
  }

  const getRegistrationStatus = (tournament) => {
    if (tournament.is_draft) return 'Draft'
    const now = new Date()
    const regStart = new Date(tournament.registration_start)
    const regEnd = new Date(tournament.registration_end)

    if (now >= regStart && now <= regEnd) return 'Open'
    return 'Closed'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing':
        return 'border-[#10B981] text-[#10B981]'
      case 'Registration':
        return 'border-[#3B82F6] text-[#3B82F6]'
      case 'Draft':
        return 'border-[#6B7280] text-[#6B7280]'
      case 'Completed':
        return 'border-[#9CA3AF] text-[#9CA3AF]'
      case 'Upcoming':
        return 'border-[#F59E0B] text-[#F59E0B]'
      case 'Registration Closed':
        return 'border-[#EF4444] text-[#EF4444]'
      default:
        return 'border-[#6B7280] text-[#6B7280]'
    }
  }

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGame = selectedGame === 'All Games' || tournament.game_title === selectedGame
    const tournamentStatus = getTournamentStatus(tournament)
    const matchesStatus = selectedStatus === 'All Status' || tournamentStatus === selectedStatus
    return matchesSearch && matchesGame && matchesStatus
  })

  return (
    <div className="flex h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <OrgSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#3B82F6]" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-bold text-[#E5E7EB]">My Tournaments</h1>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Manage and organize all your tournaments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/OrgCreateTournament')}
              className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Tournament
            </button>

            {/* Profile Menu */}
            <ProfileMenu />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-300 mx-auto p-6 space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex gap-4 items-center">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search tournaments…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-md pl-10 pr-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>

              {/* Game Filter */}
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

              {/* Status Filter */}
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

            {/* Tournaments Table */}
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
                      <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <p className="text-sm text-[#9CA3AF]">
                            Loading tournaments...
                          </p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <p className="text-sm text-red-400">
                            Failed to load tournaments. Please try again.
                          </p>
                        </td>
                      </tr>
                    ) : filteredTournaments.length > 0 ? (
                      filteredTournaments.map((tournament) => {
                        const status = getTournamentStatus(tournament)
                        const registration = getRegistrationStatus(tournament)
                        return (
                          <tr
                            key={tournament.id}
                            className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937]/30 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-[#E5E7EB] font-medium">
                              {tournament.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                              {tournament.game_title}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                              {tournament.match_format}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                              {registration}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => navigate(`/organizer/tournaments/${tournament.id}`)}
                                className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center">
                          <p className="text-sm text-[#6B7280]">
                            {searchQuery || selectedGame !== 'All Games' || selectedStatus !== 'All Status'
                              ? 'No tournaments found matching your search criteria.'
                              : 'No tournaments yet. Create your first tournament to get started!'}
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

export default OrgTournaments
