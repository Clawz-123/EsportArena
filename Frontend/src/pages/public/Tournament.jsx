import React, { useState, useEffect } from 'react'
import { Clock, Search, Calendar, X, Trophy, Users, Coins, Zap } from 'lucide-react'
import { toast } from 'react-toastify'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import JoinTournament from './card/JoinTournament'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPublicTournaments, fetchMyJoinedTournaments } from '../../slices/tournamentSlice'

const Tournament = () => {
  const dispatch = useAppDispatch()
  const { tournaments, joinedTournaments, loading, joinedLoading } = useAppSelector((state) => state.tournament)
  const { user } = useAppSelector((state) => state.auth || {})
  const [activeTab, setActiveTab] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [gameFilter, setGameFilter] = useState('')
  const [feeFilter, setFeeFilter] = useState('any')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState(null)

  useEffect(() => {
    // Fetch all public tournaments
    dispatch(fetchPublicTournaments())
    // Fetch user's joined tournaments
    dispatch(fetchMyJoinedTournaments())
  }, [dispatch])

  // Get tournament status
  const getTournamentStatus = (tournament) => {
    const now = new Date()
    const regStart = new Date(tournament.registration_start)
    const regEnd = new Date(tournament.registration_end)
    const matchStart = new Date(tournament.match_start)
    const matchEnd = tournament.expected_end ? new Date(tournament.expected_end) : null

    if (now < regStart) return 'Upcoming'
    if (now >= regStart && now <= regEnd) return 'Registration'
    if (now > regEnd && now < matchStart) return 'Registration Closed'
    if (now >= matchStart && (!matchEnd || now <= matchEnd)) return 'Ongoing'
    if (matchEnd && now > matchEnd) return 'Completed'
    return 'Unknown'
  }

  const isSameDay = (dateString, filterValue) => {
    if (!filterValue || !dateString) return true
    const date = new Date(dateString)
    const target = new Date(filterValue)
    if (Number.isNaN(date) || Number.isNaN(target)) return false
    return date.toISOString().slice(0, 10) === target.toISOString().slice(0, 10)
  }

  const matchesFeeFilter = (fee, filter) => {
    const entry = Number(fee) || 0
    switch (filter) {
      case 'free':
        return entry === 0
      case 'lt100':
        return entry > 0 && entry <= 100
      case '100to500':
        return entry > 100 && entry <= 500
      case 'gt500':
        return entry > 500
      default:
        return true
    }
  }

  const uniqueGames = Array.from(
    new Set(tournaments.map((t) => t.game_title).filter(Boolean))
  ).sort()

  const activeBase = tournaments.filter((t) => {
    const status = getTournamentStatus(t)
    const isNotJoined = !joinedTournaments.find((j) => j.id === t.id)
    return isNotJoined && status === 'Registration'
  })

  const applyFilters = (tournament) => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = isSameDay(tournament.match_start, filterDate)
    const matchesGame = gameFilter
      ? (tournament.game_title || '').toLowerCase() === gameFilter.toLowerCase()
      : true
    const matchesFee = matchesFeeFilter(tournament.entry_fee, feeFilter)
    return matchesSearch && matchesDate && matchesGame && matchesFee
  }

  const activeFiltered = activeBase.filter(applyFilters)
  const joinedFiltered = joinedTournaments.filter(applyFilters)
  const filteredTournaments = activeTab === 'active' ? activeFiltered : joinedFiltered

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterDate('')
    setGameFilter('')
    setFeeFilter('any')
  }

  // Get organizer initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get color based on name hash
  const getColorFromName = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ]
    const hash = name.charCodeAt(0) % colors.length
    return colors[hash]
  }

  const handleJoinTournament = (tournament) => {
    if (user?.is_organizer || user?.role?.toLowerCase() === 'organizer') {
      toast.info('Organizers cannot join tournaments')
      return
    }
    // Check if tournament is team-based (duo or squad)
    const isTeamBased = tournament.match_format?.toLowerCase().includes('squad') || 
                        tournament.match_format?.toLowerCase().includes('duo')

    if (isTeamBased) {
      // Open modal for team-based tournaments
      setSelectedTournament(tournament)
      setShowJoinModal(true)
    } else {
      // Direct join for solo tournaments
      handleSoloJoin(tournament)
    }
  }

  const handleSoloJoin = async (tournament) => {
    // For solo tournaments, open the modal to collect IGN
    toast.info('Please provide your in-game name to join')
    setSelectedTournament(tournament)
    setShowJoinModal(true)
  }

  const handleModalJoinSuccess = () => {
    // Refresh tournaments after successful join
    dispatch(fetchPublicTournaments())
    dispatch(fetchMyJoinedTournaments())
  }

  const getTotalPrize = (tournament) => {
    const prizePool = Number(tournament.total_prize_pool)
    if (!Number.isNaN(prizePool) && prizePool > 0) return prizePool

    const directPool = Number(tournament.prize_pool)
    if (!Number.isNaN(directPool) && directPool > 0) return directPool

    const first = Number(tournament.prize_first) || 0
    const second = Number(tournament.prize_second) || 0
    const third = Number(tournament.prize_third) || 0
    const sum = first + second + third
    return sum > 0 ? sum : 0
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[28px] font-bold text-[#E5E7EB] mb-2">
            Tournaments
          </h1>
          <p className="text-[14px] text-[#9CA3AF]">
            Discover and join competitive esports tournaments hosted by verified organizers.
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search by tournament name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-12 pr-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
            </div>

            {/* Game Type Filter */}
            <div>
              <div className="relative">
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors tournament-select"
                >
                  <option value="">All games</option>
                  {uniqueGames.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Entry Fee Filter */}
            <div>
              <div className="relative">
                <select
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors tournament-select"
                >
                  <option value="any">Any fee</option>
                  <option value="free">Free only</option>
                  <option value="lt100">Up to 100</option>
                  <option value="100to500">100 - 500</option>
                  <option value="gt500">500+</option>
                </select>
              </div>
            </div>

            {/* Date Filter + Clear */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-12 pr-4 py-3 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
              <button
                onClick={handleClearFilters}
                className="text-[#3B82F6] hover:text-[#2563EB] text-[14px] font-medium transition-colors px-3"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#111827] text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              <Zap className="w-4 h-4" />
              Active ({activeFiltered.length})
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-medium transition-colors ${
                activeTab === 'joined'
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#111827] text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Joined ({joinedFiltered.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="flex items-center gap-2 mb-8">
            <Clock className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-[16px] font-semibold text-[#E5E7EB]">
              {activeTab === 'active' ? 'Active Tournaments' : 'Your Tournaments'}
            </h2>
          </div>

          {/* Tournament Grid */}
          {(loading || joinedLoading) ? (
            <div className="text-center py-12">
              <p className="text-[16px] text-[#6B7280]">Loading tournaments...</p>
            </div>
          ) : filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 hover:border-[#3B82F6]/50 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-[15px] font-semibold text-[#E5E7EB] mb-1">
                        {tournament.name}
                      </h3>
                      <p className="text-[12px] text-[#9CA3AF]">
                        {tournament.game_title}
                      </p>
                    </div>
                    <span className="text-[12px] font-medium text-[#22C55E]">
                      {getTournamentStatus(tournament)}
                    </span>
                  </div>

                  {/* Organizer Section */}
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#1F2937]">
                    {tournament.organizer_profile_image ? (
                      <img
                        src={tournament.organizer_profile_image}
                        alt={tournament.organizer_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full ${getColorFromName(tournament.organizer_name || 'User')} flex items-center justify-center text-white font-semibold text-[12px]`}
                      >
                        {getInitials(tournament.organizer_name || 'User')}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-[12px] text-[#6B7280]">Organizer</p>
                      <div className="flex items-center gap-1">
                        <p className="text-[14px] font-medium text-[#E5E7EB]">
                          {tournament.organizer_name || 'Unknown'}
                        </p>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-[13px]">
                      <Calendar className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-[#9CA3AF]">
                        {new Date(tournament.match_start).toLocaleDateString('en-NP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px]">
                      <Users className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-[#9CA3AF]">0/{tournament.max_participants}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px]">
                      <Coins className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-[#9CA3AF]">{tournament.entry_fee || 0} Coins</span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px]">
                      <Trophy className="w-4 h-4 text-[#EC4899]" />
                      <span className="text-[#EC4899] font-medium">{getTotalPrize(tournament)} Prize</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {joinedTournaments.find(j => j.id === tournament.id) ? (
                    <button
                      onClick={() => window.location.href = `/tournaments/${tournament.id}`}
                      className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-3 px-4 rounded-lg text-[14px] transition-colors cursor-pointer"
                    >
                      View Tournament
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinTournament(tournament)}
                      className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-3 px-4 rounded-lg text-[14px] transition-colors"
                    >
                      Join Tournament
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[16px] text-[#6B7280]">
                No tournaments found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Join Tournament Modal */}
      <JoinTournament
        tournament={selectedTournament}
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false)
          setSelectedTournament(null)
        }}
        onJoin={handleModalJoinSuccess}
      />
    </div>
  )
}

export default Tournament
