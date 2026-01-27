import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchTournamentDetail,
  fetchTournamentTeams,
} from '../../../slices/tournamentSlice'
import OrgSidebar from '../OrgSidebar'
import ProfileMenu from '../../../components/common/ProfileMenu'
import ParticipantCard from './ParticapantCard'
import BracketCard from './BaracketCard'
import MatchesCard from './MatchesCard'
import LeaderBoardCard from './LeaderBoardCard'
import ForumCard from './ForumCard'
import {
  ChevronLeft,
  Users,
  DollarSign,
  Trophy,
  Calendar,
} from 'lucide-react'

const OrgTournamentHeader = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { currentTournament, loading, teams } = useAppSelector((state) => state.tournament)
  const [activeTab, setActiveTab] = useState('participants')

  useEffect(() => {
    if (id) {
      dispatch(fetchTournamentDetail(id))
      dispatch(fetchTournamentTeams(id))
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
      label: 'Teams Registered',
      value: `${teams?.length || 0}/${tournament.max_participants || 0}`,
      icon: Users,
    },
    {
      label: 'Entry Fee',
      value: `Rs. ${tournament.entry_fee || 0}`,
      icon: DollarSign,
    },
    {
      label: 'Prize Pool',
      value: `Rs. ${tournament.total_prize_pool || (tournament.prize_first || 0) + (tournament.prize_second || 0) + (tournament.prize_third || 0)}`,
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'participants':
        return <ParticipantCard tournamentId={id} />
      case 'bracket':
        return <BracketCard tournamentId={id} />
      case 'matches':
        return <MatchesCard tournamentId={id} />
      case 'leaderboard':
        return <LeaderBoardCard tournamentId={id} />
      case 'forum':
        return <ForumCard tournamentId={id} />
      default:
        return <ParticipantCard tournamentId={id} />
    }
  }

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

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrgTournamentHeader
