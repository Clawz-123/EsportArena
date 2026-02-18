import React, { useEffect, useMemo, useState } from 'react'
import { Check, X, Filter, Search, Eye, AlertCircle, CheckCircle2, XCircle, Clock, ChevronDown, Trophy } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import OrgSidebar from '../organizer/OrgSidebar'
import { fetchOrganizerTournaments } from '../../slices/tournamentSlice'
import { fetchOrganizerResults, updateResultStatus } from '../../slices/resultSlice'
import { toast } from 'react-toastify'

const STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

const TabButton = ({ id, label, count, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === id
      ? 'bg-[#0f172a] text-white shadow-sm ring-1 ring-white/5'
      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
  >
    {Icon && <Icon className={`w-4 h-4 ${activeTab === id ? 'text-blue-500' : 'text-slate-500'}`} />}
    <span>{label}</span>
    <span className={`${activeTab === id ? 'text-slate-200' : 'text-slate-500'
      }`}>
      ({count})
    </span>
  </button>
)

const OrgResultVerification = () => {
  const dispatch = useAppDispatch()
  const { tournaments, loading: tournamentsLoading } = useAppSelector((state) => state.tournament || {})
  const { results, loading: resultsLoading, updateLoading } = useAppSelector((state) => state.result || {})

  const [activeTab, setActiveTab] = useState('pending')
  const [selectedTournamentId, setSelectedTournamentId] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResult, setSelectedResult] = useState(null)

  useEffect(() => {
    dispatch(fetchOrganizerTournaments())
    dispatch(fetchOrganizerResults())
  }, [dispatch])

  const formatDateTime = (value) => {
    if (!value) return 'TBD'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'TBD'
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  const filteredByTournament = useMemo(() => {
    let filtered = results || []

    if (selectedTournamentId !== 'all') {
      const tournamentId = Number(selectedTournamentId)
      filtered = filtered.filter((result) => result.tournament === tournamentId)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.match_number?.toString().includes(term) ||
          r.match?.toString().includes(term) ||
          r.team_name?.toLowerCase().includes(term) ||
          r.submitted_by_name?.toLowerCase().includes(term) ||
          r.submitted_by_email?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [results, selectedTournamentId, searchTerm])

  const counts = useMemo(() => {
    const initial = { all: 0, pending: 0, approved: 0, rejected: 0 }
    return (results || []).reduce((acc, result) => {
      if (selectedTournamentId !== 'all' && result.tournament !== Number(selectedTournamentId)) return acc;

      acc.all += 1
      if (result.status === STATUS.PENDING) acc.pending += 1
      if (result.status === STATUS.APPROVED) acc.approved += 1
      if (result.status === STATUS.REJECTED) acc.rejected += 1
      return acc
    }, initial)
  }, [results, selectedTournamentId])

  const filteredResults = useMemo(() => {
    let res = filteredByTournament
    if (activeTab === 'pending') {
      res = res.filter((r) => r.status === STATUS.PENDING)
    } else if (activeTab === 'approved') {
      res = res.filter((r) => r.status === STATUS.APPROVED)
    } else if (activeTab === 'rejected') {
      res = res.filter((r) => r.status === STATUS.REJECTED)
    }
    return res
  }, [activeTab, filteredByTournament])

  const handleStatusUpdate = async (result, status) => {
    const response = await dispatch(updateResultStatus({
      resultId: result.id,
      status,
      organizer_note: '',
    }))

    if (updateResultStatus.fulfilled.match(response)) {
      const payload = response.payload?.Result || response.payload?.result
      const updated = payload?.result
      if (updated) {
        setSelectedResult((current) => (current?.id === updated.id ? updated : current))
      }
      toast.success(status === STATUS.APPROVED ? 'Result verified' : 'Result rejected')
      dispatch(fetchOrganizerResults())
      return
    }

    toast.error('Failed to update result status')
  }

  return (
    <>
      <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans">
        <OrgSidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Simple Header */}
        <header className="border-b border-slate-800 bg-[#0f172a] px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Result Verification</h1>
              <p className="text-sm text-slate-500 mt-1">Manage and verify match results.</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* Simple Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700/50">
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-500">{counts.pending}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700/50">
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Verified</div>
              <div className="text-2xl font-bold text-emerald-500">{counts.approved}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700/50">
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Rejected</div>
              <div className="text-2xl font-bold text-rose-500">{counts.rejected}</div>
            </div>
            <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700/50">
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total</div>
              <div className="text-2xl font-bold text-white">{counts.all}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex bg-[#1e293b] p-1.5 rounded-xl border border-white/5">
              <TabButton id="pending" label="Pending" count={counts.pending} icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton id="approved" label="Verified" count={counts.approved} icon={CheckCircle2} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton id="rejected" label="Rejected" count={counts.rejected} icon={XCircle} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="flex gap-3 w-full sm:w-auto items-center">
              <div className="relative">
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="bg-[#1e293b] border border-slate-700 text-white text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-600 transition-colors"
                >
                  <option value="all">All Tournaments</option>
                  {tournamentsLoading ? (
                    <option value="loading" disabled>Loading...</option>
                  ) : (
                    tournaments?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1e293b] border border-slate-700 text-white text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 w-full sm:w-64 placeholder-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Match</th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Submitted By</th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF] hidden md:table-cell">Group</th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Date</th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Status</th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {resultsLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-[#9CA3AF]">
                      Loading results...
                    </td>
                  </tr>
                ) : filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-[#9CA3AF]">
                      No results found.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result) => (
                    <tr key={result.id} className="hover:bg-[#0F172A] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#E5E7EB]">
                        Match {result.match_number || result.match}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#E5E7EB]">
                        {result.team_name || 'No team'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#E5E7EB] hidden md:table-cell">
                        {result.group_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#9CA3AF]">
                        {formatDateTime(result.submitted_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                          result.status === STATUS.PENDING
                            ? 'border-[#F59E0B] text-[#F59E0B]'
                            : result.status === STATUS.APPROVED
                              ? 'border-[#10B981] text-[#10B981]'
                              : 'border-[#F43F5E] text-[#F43F5E]'
                        }`}>
                          {result.status === STATUS.APPROVED ? 'Verified' : result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-sm text-[#9CA3AF]">
                          <button
                            className="p-1.5 hover:bg-[#0F172A] hover:text-[#3B82F6] rounded-md"
                            title="View Proof"
                            onClick={() => setSelectedResult(result)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {result.status === STATUS.PENDING && (
                            <>
                              <button
                                className="p-1.5 hover:bg-[#0F172A] hover:text-[#10B981] rounded-md"
                                title="Approve"
                                onClick={() => handleStatusUpdate(result, STATUS.APPROVED)}
                                disabled={updateLoading}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 hover:bg-[#0F172A] hover:text-[#F43F5E] rounded-md"
                                title="Reject"
                                onClick={() => handleStatusUpdate(result, STATUS.REJECTED)}
                                disabled={updateLoading}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
    {selectedResult && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-[#0F172A] border border-[#1F2937] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1F2937]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#111827] flex items-center justify-center text-[#60A5FA]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Result Submission Details</h2>
                <p className="text-sm text-[#9CA3AF]">Review submitted proof before verifying.</p>
              </div>
            </div>
            <button
              className="p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#111827]"
              onClick={() => setSelectedResult(null)}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase">Match</p>
                <p className="text-base text-white">Match {selectedResult.match_number || selectedResult.match}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase">Group</p>
                <p className="text-base text-white">{selectedResult.group_name}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase">Team</p>
                <p className="text-base text-white">{selectedResult.team_name || 'No team'}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase">Status</p>
                <p className="text-base text-white">{selectedResult.status}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-white mb-3">Proof Screenshot</p>
              <div className="bg-[#111827] border border-[#1F2937] rounded-xl min-h-70 max-h-[60vh] flex items-center justify-center overflow-hidden">
                {selectedResult.proof_image ? (
                  <img
                    src={selectedResult.proof_image}
                    alt="Proof"
                    className="max-h-[60vh] w-auto object-contain"
                  />
                ) : (
                  <p className="text-sm text-[#9CA3AF]">No proof image provided.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default OrgResultVerification
