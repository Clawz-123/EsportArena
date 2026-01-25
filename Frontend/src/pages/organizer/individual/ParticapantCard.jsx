import React, { useState } from 'react'
import { Search, Eye, Check, X } from 'lucide-react'

const ParticipantCard = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTeam, setSearchTeam] = useState('')

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

  return (
    <div className="space-y-4">
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
  )
}

export default ParticipantCard
