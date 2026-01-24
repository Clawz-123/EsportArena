import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentDetail } from '../../../slices/tournamentSlice'
import OrgSidebar from '../OrgSidebar'
import ProfileMenu from '../../../components/common/ProfileMenu'
import {
  ChevronLeft,
  Users,
  DollarSign,
  Trophy,
  Calendar,
  Search,
  Eye,
  Check,
  X,
} from 'lucide-react'

const OrgParticipant = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { currentTournament, loading } = useAppSelector((state) => state.tournament)
  const [activeTab, setActiveTab] = useState('participants')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTeam, setSearchTeam] = useState('')

  useEffect(() => {
    if (id) {
      dispatch(fetchTournamentDetail(id))
    }
  }, [id, dispatch])

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0F172A]">
        <OrgSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#9CA3AF]">Loading tournament...</p>
        </div>
      </div>
    )
  }

  const tournament = currentTournament || {}

  // Mock teams data - replace with actual API data
  const allTeams = [
    {
      id: 1,
      name: 'Team Phoenix',
      captain: 'Alex Kumar',
      members: 4,
      contact: 'alex@example.com',
      status: 'approved',
    },
    {
      id: 2,
      name: 'Shadow Squad',
      captain: 'Raj Patel',
      members: 4,
      contact: 'raj@example.com',
      status: 'approved',
    },
    {
      id: 3,
      name: 'Elite Warriors',
      captain: 'Priya Singh',
      members: 3,
      contact: 'priya@example.com',
      status: 'pending',
    },
    {
      id: 4,
      name: 'Storm Riders',
      captain: 'Vikram Sharma',
      members: 4,
      contact: 'vikram@example.com',
      status: 'pending',
    },
  ]

  // Filter teams
  const filteredTeams = allTeams
    .filter((team) => (activeFilter === 'all' ? true : team.status === activeFilter))
    .filter((team) =>
      team.name.toLowerCase().includes(searchTeam.toLowerCase()) ||
      team.captain.toLowerCase().includes(searchTeam.toLowerCase())
    )

  const getTournamentStatus = (tournament) => {
    if (!tournament) return 'upcoming'
    const now = new Date()
    const matchStart = new Date(tournament.match_start)
    const matchEnd = tournament.expected_end ? new Date(tournament.expected_end) : null

    if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'ongoing'
    if (matchEnd && now > matchEnd) return 'completed'
    return 'upcoming'
  }

  const status = getTournamentStatus(tournament)
  const statusColor = status === 'ongoing' ? 'bg-[#10B981]' : status === 'completed' ? 'bg-[#9CA3AF]' : 'bg-[#3B82F6]'

  const summaryCards = [
    {
      label: 'Participants',
      value: `${tournament.current_participants || 0}/${tournament.max_participants || 0}`,
      icon: Users,
    },
    {
      label: 'Entry Fee',
      value: `Rs. ${tournament.entry_fee || 0}`,
      icon: DollarSign,
    },
    {
      label: 'Prize Pool',
      value: `Rs. ${(tournament.prize_first || 0) + (tournament.prize_second || 0) + (tournament.prize_third || 0)}`,
      icon: Trophy,
    },
    {
      label: 'Schedule',
      value: tournament.match_start ? new Date(tournament.match_start).toLocaleDateString() : 'TBD',
      icon: Calendar,
    },
  ]

  const tabs = [
    { id: 'participants', label: 'Participants' },
    { id: 'bracket', label: 'Bracket' },
    { id: 'matches', label: 'Matches' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'forum', label: 'Forum' },
  ]

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <OrgSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-4 flex items-center justify-between">
          <div />
          <ProfileMenu />
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Back Navigation */}
            <button
              onClick={() => navigate('/Orgtournaments')}
              className="flex items-center gap-2 text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Tournaments</span>
            </button>

            {/* Tournament Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColor}`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-[#9CA3AF]">
                  {tournament.game_title} · {tournament.description || 'Battle Royale'}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-md bg-[#1E293B] text-white hover:bg-[#2D3748] transition-colors">
                  Edit Tournament
                </button>
                <button className="px-4 py-2 rounded-md bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors font-semibold">
                  Verify Results
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              {summaryCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E293B] border border-[#2D3748] rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-[#9CA3AF] uppercase">{card.label}</span>
                    <card.icon className="w-5 h-5 text-[#3B82F6]" strokeWidth={1.5} />
                  </div>
                  <p className="text-2xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-[#1F2937]">
              <div className="flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div className="space-y-4">
                {/* Registered Teams Section */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Registered Teams</h2>
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

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                      {['all', 'pending', 'approved'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeFilter === filter
                              ? 'bg-[#3B82F6] text-white'
                              : 'bg-[#1E293B] text-[#9CA3AF] hover:text-white'
                          }`}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
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
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-[#9CA3AF] uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeams.length > 0 ? (
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
                                {team.members}/4
                              </td>
                              <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                                {team.contact}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                    team.status === 'approved'
                                      ? 'bg-[#10B981] text-white'
                                      : 'bg-[#2D3748] text-[#9CA3AF]'
                                  }`}
                                >
                                  {team.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-3">
                                  <button
                                    className="p-1 hover:bg-[#3B82F6]/10 rounded transition-colors"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4 text-[#3B82F6]" />
                                  </button>
                                  {team.status === 'pending' && (
                                    <>
                                      <button
                                        className="p-1 hover:bg-[#10B981]/10 rounded transition-colors"
                                        title="Approve"
                                      >
                                        <Check className="w-4 h-4 text-[#10B981]" />
                                      </button>
                                      <button
                                        className="p-1 hover:bg-[#EF4444]/10 rounded transition-colors"
                                        title="Reject"
                                      >
                                        <X className="w-4 h-4 text-[#EF4444]" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center">
                              <p className="text-[#6B7280] text-sm">
                                No teams found.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Other Tabs - Placeholder */}
            {['bracket', 'matches', 'leaderboard', 'forum'].includes(activeTab) && (
              <div className="bg-[#1E293B] border border-[#2D3748] rounded-lg p-8 text-center">
                <p className="text-[#9CA3AF]">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content coming soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrgParticipant
