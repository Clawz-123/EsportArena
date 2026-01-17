import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrgSidebar from './OrgSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { Calendar, ChevronDown } from 'lucide-react'

const OrgCreateTournament = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    tournamentName: '',
    gameTitle: '',
    matchFormat: '',
    description: '',
    registrationStart: '',
    registrationEnd: '',
    matchStart: '',
    expectedEnd: '',
    maxParticipants: '',
    autoGenerateBracket: false,
    entryFee: '0',
    prizeFirst: '0',
    prizeSecond: '0',
    prizeThird: '0',
    matchRules: '',
    requireResultProof: false,
    proofType: 'Screenshot Only',
    resultTimeLimit: '24',
    visibility: 'Public',
    autoStartTournament: false,
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const calculateTotalPrize = () => {
    return (
      (parseInt(formData.prizeFirst) || 0) +
      (parseInt(formData.prizeSecond) || 0) +
      (parseInt(formData.prizeThird) || 0)
    )
  }

  const handleCreateTournament = (e) => {
    e.preventDefault()
    console.log('Creating tournament:', formData)
    navigate('/organizer/tournaments')
  }

  const handleSaveDraft = (e) => {
    e.preventDefault()
    console.log('Saving as draft:', formData)
  }

  return (
    <div className="flex h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <OrgSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB]">Create Tournament</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Set up a new tournament by filling out the information below.
            </p>
          </div>
          <ProfileMenu />
        </header>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleCreateTournament} className="max-w-2xl mx-auto p-6 space-y-6">
            {/* SECTION 1: Basic Information */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
              <h2 className="text-base font-semibold text-[#E5E7EB]">Basic Information</h2>

              {/* Tournament Name */}
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Tournament Name
                </label>
                <input
                  type="text"
                  name="tournamentName"
                  value={formData.tournamentName}
                  onChange={handleInputChange}
                  placeholder="Enter tournament name"
                  className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>

              {/* Game Title & Match Format */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Game Title
                  </label>
                  <div className="relative">
                    <select
                      name="gameTitle"
                      value={formData.gameTitle}
                      onChange={handleInputChange}
                      className="appearance-none w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
                    >
                      <option value="">Select game</option>
                      <option value="PUBG Mobile">PUBG Mobile</option>
                      <option value="Free Fire">Free Fire</option>
                      <option value="Valorant">Valorant</option>
                      <option value="CS2">CS2</option>
                      <option value="Mobile Legends">Mobile Legends</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Match Format
                  </label>
                  <div className="relative">
                    <select
                      name="matchFormat"
                      value={formData.matchFormat}
                      onChange={handleInputChange}
                      className="appearance-none w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
                    >
                      <option value="">Select format</option>
                      <option value="Solo">Solo</option>
                      <option value="Duo">Duo</option>
                      <option value="Squad">Squad</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter tournament description, rules overview, etc."
                  rows="4"
                  className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
                />
              </div>
            </div>

            {/* SECTION 2: Schedule & Registration */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
              <h2 className="text-base font-semibold text-[#E5E7EB]">Schedule & Registration</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Registration Start
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="registrationStart"
                      value={formData.registrationStart}
                      onChange={handleInputChange}
                      className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Registration End
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="registrationEnd"
                      value={formData.registrationEnd}
                      onChange={handleInputChange}
                      className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#6B7280]">Must be before match start date</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Match Start
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="matchStart"
                      value={formData.matchStart}
                      onChange={handleInputChange}
                      className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Expected End
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="expectedEnd"
                      value={formData.expectedEnd}
                      onChange={handleInputChange}
                      className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Tournament Structure */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
              <h2 className="text-base font-semibold text-[#E5E7EB]">Tournament Structure</h2>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Maximum Participants / Teams
                </label>
                <div className="relative">
                  <select
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className="appearance-none w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
                  >
                    <option value="">Select capacity</option>
                    <option value="8">8</option>
                    <option value="16">16</option>
                    <option value="32">32</option>
                    <option value="64">64</option>
                    <option value="128">128</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoGenerateBracket"
                  name="autoGenerateBracket"
                  checked={formData.autoGenerateBracket}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded bg-[#0F172A] border border-[#1F2937] cursor-pointer accent-[#3B82F6]"
                />
                <label htmlFor="autoGenerateBracket" className="text-sm text-[#E5E7EB] cursor-pointer">
                  Auto-generate bracket after registration closes
                </label>
              </div>
              <p className="text-xs text-[#6B7280]">
                Bracket will be automatically created when the registration period ends
              </p>
            </div>

            {/* SECTION 4: Entry Fee & Prize Pool */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
              <h2 className="text-base font-semibold text-[#E5E7EB]">Entry Fee & Prize Pool</h2>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Entry Fee (Coins)
                </label>
                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <p className="text-xs text-[#6B7280] mt-1">Set to 0 for free entry</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-3">
                  Prize Distribution (Coins)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#9CA3AF] mb-2">1st Place</label>
                    <input
                      type="number"
                      name="prizeFirst"
                      value={formData.prizeFirst}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9CA3AF] mb-2">2nd Place</label>
                    <input
                      type="number"
                      name="prizeSecond"
                      value={formData.prizeSecond}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9CA3AF] mb-2">3rd Place</label>
                    <input
                      type="number"
                      name="prizeThird"
                      value={formData.prizeThird}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#1F2937]">
                <span className="text-sm font-medium text-[#E5E7EB]">Total Prize Pool</span>
                <span className="text-sm font-semibold text-[#3B82F6]">{calculateTotalPrize()} Coins</span>
              </div>
            </div>

            {/* SECTION 5: Match Rules & Result Settings */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
              <h2 className="text-base font-semibold text-[#E5E7EB]">Match Rules & Result Settings</h2>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Match Rules (Optional)
                </label>
                <textarea
                  name="matchRules"
                  value={formData.matchRules}
                  onChange={handleInputChange}
                  placeholder="Enter rules, restrictions, or guidelines"
                  rows="4"
                  className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireResultProof"
                  name="requireResultProof"
                  checked={formData.requireResultProof}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded bg-[#0F172A] border border-[#1F2937] cursor-pointer accent-[#3B82F6]"
                />
                <label htmlFor="requireResultProof" className="text-sm text-[#E5E7EB] cursor-pointer">
                  Require result proof for verification
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Accepted Proof Type
                </label>
                <div className="relative">
                  <select
                    name="proofType"
                    value={formData.proofType}
                    onChange={handleInputChange}
                    className="appearance-none w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
                  >
                    <option value="Screenshot Only">Screenshot Only</option>
                    <option value="Video Only">Video Only</option>
                    <option value="Screenshot or Video">Screenshot or Video</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                  Result Submission Time Limit (Hours)
                </label>
                <input
                  type="number"
                  name="resultTimeLimit"
                  value={formData.resultTimeLimit}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full bg-[#0F172A] border border-[#1F2937] rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <p className="text-xs text-[#6B7280] mt-1">
                  Time allowed for players to submit results after a match
                </p>
              </div>
            </div>

            {/* SECTION 6: Visibility & Control */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
              <h2 className="text-base font-semibold text-[#E5E7EB]">Visibility & Control</h2>

              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-3">
                  Tournament Visibility
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="public"
                      name="visibility"
                      value="Public"
                      checked={formData.visibility === 'Public'}
                      onChange={handleInputChange}
                      className="w-4 h-4 cursor-pointer accent-[#3B82F6]"
                    />
                    <label htmlFor="public" className="text-sm text-[#E5E7EB] cursor-pointer">
                      Public – listed in tournament directory
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="private"
                      name="visibility"
                      value="Private"
                      checked={formData.visibility === 'Private'}
                      onChange={handleInputChange}
                      className="w-4 h-4 cursor-pointer accent-[#3B82F6]"
                    />
                    <label htmlFor="private" className="text-sm text-[#E5E7EB] cursor-pointer">
                      Private – invite only
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoStartTournament"
                  name="autoStartTournament"
                  checked={formData.autoStartTournament}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded bg-[#0F172A] border border-[#1F2937] cursor-pointer accent-[#3B82F6]"
                />
                <label htmlFor="autoStartTournament" className="text-sm text-[#E5E7EB] cursor-pointer">
                  Auto-start tournament when slots are full
                </label>
              </div>
              <p className="text-xs text-[#6B7280]">
                Tournament will automatically start when the maximum participant limit is reached
              </p>
            </div>

            {/* Form Action Buttons */}
            <div className="flex gap-4 justify-center pb-8">
              <button
                type="submit"
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-8 py-2.5 rounded-md transition-colors"
              >
                Create Tournament
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-transparent border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 font-semibold px-8 py-2.5 rounded-md transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => navigate('/organizer/tournaments')}
                className="text-[#9CA3AF] hover:text-[#E5E7EB] font-medium px-8 py-2.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrgCreateTournament
