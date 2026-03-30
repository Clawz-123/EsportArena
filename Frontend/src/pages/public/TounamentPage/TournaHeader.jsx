import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentDetail, fetchTournamentParticipants, fetchTournamentTeams } from '../../../slices/tournamentSlice'
import { ChevronLeft, Calendar, Users, DollarSign, Trophy } from 'lucide-react'
import Header from '../../../components/common/Header'
import OverviewCard from './OverviewCard'
import ForumCard from './ForumCard'
import Leaderboard from './Leaderboard'

const TournaHeader = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { currentTournament, loading, participants, teams } = useAppSelector((state) => state.tournament)
  const { profile } = useAppSelector((state) => state.profile || {})
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) {
      dispatch(fetchTournamentDetail(id))
      dispatch(fetchTournamentParticipants(id))
      dispatch(fetchTournamentTeams(id))
    }
  }, [id, dispatch])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-[#9CA3AF]">Loading tournament...</p>
        </div>
      </div>
    )
  }

  const tournament = currentTournament || {}

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

  const participantCount = participants?.length || 0
  const teamCount = teams?.length || 0
  const isTeamBased = ['Duo', 'Squad'].includes(tournament.match_format)

  const statsCards = [
    {
      label: 'Start Date',
      value: tournament.match_start
        ? new Date(tournament.match_start).toLocaleDateString()
        : 'TBD',
      icon: Calendar,
    },
    {
      label: isTeamBased ? 'Teams' : 'Participants',
      value: `${isTeamBased ? teamCount : participantCount}`,
      icon: Users,
    },
    {
      label: 'Entry Fee',
      value: `${tournament.entry_fee || 0} Coins`,
      icon: DollarSign,
    },
    {
      label: 'Prize Pool',
      value: `${tournament.total_prize_pool || (tournament.prize_first || 0) + (tournament.prize_second || 0) + (tournament.prize_third || 0)}`,
      icon: Trophy,
    },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'forums', label: 'Forums' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewCard tournament={tournament} />
      case 'forums':
        return <ForumCard tournament={tournament} />
      case 'leaderboard':
        return <Leaderboard tournament={tournament} />
      default:
        return <OverviewCard tournament={tournament} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/tournaments')}
          className="flex items-center gap-2 text-[#2563EB] hover:text-[#1d4ed8] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Tournaments</span>
        </button>

        {/* Tournament Header Section */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Left - Tournament Info */}
          <div className="col-span-2">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{tournament.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${status === 'ongoing' ? 'bg-[#10B981]' :
                  status === 'completed' ? 'bg-[#6B7280]' :
                    'bg-[#2563EB]'
                  }`}>
                  {status}
                </span>
              </div>
              <p className="text-[#9CA3AF] text-sm mb-3">{tournament.game_title}</p>
              <p className="text-[#9CA3AF] leading-relaxed">
                {tournament.description || 'Join this competitive esports tournament and showcase your skills against the best teams.'}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3">
              {statsCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#111827] border border-[#1F2937] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#9CA3AF] uppercase">{card.label}</span>
                    <card.icon className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <p className="text-xl font-bold text-white">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Organizer Card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 h-fit">
            <p className="text-xs text-[#9CA3AF] uppercase mb-3">Organizer</p>
            <div className="flex items-center gap-3 mb-4">
              {tournament.organizer_profile_image || profile?.profile_image ? (
                <img
                  src={tournament.organizer_profile_image || profile?.profile_image}
                  alt={tournament.organizer_name || 'Organizer'}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-white">
                    {tournament.organizer_name?.charAt(0) || 'O'}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-sm">{tournament.organizer_name || 'Unknown'}</p>
                <p className="text-[#6B7280] text-xs">Verified Organizer</p>
              </div>
            </div>
            <button className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-medium py-2 rounded-lg transition-colors text-sm">
              Join Discord
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex bg-[#111827] p-1 rounded-lg w-full border border-[#1F2937]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium rounded-md transition-all text-center ${activeTab === tab.id
                  ? 'bg-[#2563EB] text-white shadow-lg'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {renderTabContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0B1220] border-t border-[#1F2937] mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-8 mb-8">
            {/* Column 1 */}
            <div>
              <h4 className="text-white font-bold mb-4">Esports Arena</h4>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">
                A modern platform for organizing and participating in competitive esports tournaments with secure payments and automated management.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase">Platform</h4>
              <ul className="space-y-2">
                <li><a href="/tournaments" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Browse Tournaments</a></li>
                <li><a href="/leaderboard" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Leaderboard</a></li>
                <li><a href="/forum" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Forum</a></li>
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">How It Works</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase">Support & Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Help Center</a></li>
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase">Community</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Report Issue</a></li>
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Feedback</a></li>
                <li><a href="#" className="text-[#9CA3AF] hover:text-white text-sm transition-colors">Sponsorship</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-[#1F2937] pt-6 text-center text-[#6B7280] text-sm">
            <p>© 2026 Esports Arena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TournaHeader

