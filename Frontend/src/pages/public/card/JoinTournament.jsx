import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { X, Star, Upload, Search, Users as UsersIcon, Loader2 } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../../store/hooks'
import { toast } from 'react-toastify'
import { stepOneSchema, stepTwoSchema } from '../../utils/joinTournamentValidation'
import {
  joinTournament,
  clearSuccess,
  clearError,
  fetchUsers,
  fetchTournamentParticipants,
} from '../../../slices/tournamentSlice'

const JoinTournament = ({ tournament, isOpen, onClose, onJoin }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { profile } = useAppSelector((state) => state.profile || {})
  const {
    joinLoading,
    joinSuccess,
    joinError,
    users,
    usersLoading,
    usersError,
    participants,
    participantsLoading,
    participantsError,
  } = useAppSelector((state) => state.tournament)

  const [searchTerm, setSearchTerm] = useState('')
  const [logoPreview, setLogoPreview] = useState(null)
  const [showIGNSection, setShowIGNSection] = useState(false)

  useEffect(() => {
    if (isOpen && tournament?.id) {
      dispatch(fetchUsers())
      dispatch(fetchTournamentParticipants(tournament.id))
      dispatch(clearSuccess())
      dispatch(clearError())
    }
  }, [isOpen, tournament?.id, dispatch])

  useEffect(() => {
    if (isOpen && (usersError || participantsError)) {
      toast.error('Failed to load players')
    }
  }, [isOpen, usersError, participantsError])

  const allPlayers = useMemo(() => {
    if (usersError || participantsError) {
      return []
    }

    const registeredIds = new Set((participants || []).map((participant) => participant.player))

    return (users || []).filter(
      (u) => u.id !== user?.id && !u.is_organizer && !registeredIds.has(u.id)
    )
  }, [users, participants, usersError, participantsError, user?.id])

  useEffect(() => {
    if (joinSuccess) {
      toast.success('Successfully joined tournament!')
      dispatch(clearSuccess())
      if (onJoin) {
        onJoin()
      }
      onClose()
    }
  }, [joinSuccess, dispatch, onClose, onJoin])

  useEffect(() => {
    if (joinError) {
      const errorMessage = joinError?.error_message || joinError?.message || 'Failed to join tournament'
      toast.error(errorMessage)
      dispatch(clearError())
    }
  }, [joinError, dispatch])

  if (!isOpen || !tournament) {
    return null
  }

  const loadingPlayers = usersLoading || participantsLoading

  const isTeamBased = tournament.match_format?.toLowerCase().includes('squad') ||
                       tournament.match_format?.toLowerCase().includes('duo')

  // For squad: captain + 3 members = 4, For duo: captain + 1 member = 2
  const requiredMembers = tournament.match_format?.toLowerCase().includes('squad') ? 3 : 1
  const userBalance = 500 // This should come from user profile/wallet
  const entryFee = Number(tournament.entry_fee) || 0

  const captainName = profile?.username || user?.name || user?.email || 'Player'
  const captainId = user?.id

  const handleLogoUpload = (e, setFieldValue) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo size must be less than 2MB')
        return
      }
      setFieldValue('teamLogo', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const initialValues = {
    teamName: '',
    teamLogo: null,
    selectedMembers: [],
    inGameNames: captainId ? {
      [captainId]: '',
    } : {},
  }

  const handleClose = () => {
    setLogoPreview(null)
    setShowIGNSection(false)
    setSearchTerm('')
    if (onClose) {
      onClose()
    }
  }

  if (joinSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-[#0F172A] border border-[#1F2937] rounded-xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-2">Successfully Joined!</h2>
          <p className="text-[#9CA3AF] mb-6 text-center">You have joined <span className="font-semibold text-white">{tournament.name}</span>.</p>
          <button
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-6 rounded-lg text-[15px] transition-colors mb-2 w-full"
            onClick={() => {
              handleClose()
              navigate(`/tournaments/${tournament.id}`)
            }}
          >
            View Tournament
          </button>
        </div>
      </div>
    )
  }

  return (
    <Formik
      key={`${tournament?.id || 't'}-${isOpen}`}
      initialValues={initialValues}
      enableReinitialize
      validationSchema={
        showIGNSection
          ? stepTwoSchema(captainId)
          : stepOneSchema(isTeamBased, requiredMembers)
      }
      onSubmit={async (values, actions) => {
        if (!showIGNSection) {
          setShowIGNSection(true)
          actions.setSubmitting(false)
          return
        }

        if (userBalance < entryFee) {
          toast.error('Insufficient balance')
          actions.setSubmitting(false)
          return
        }

        // Prepare data for backend
        const joinData = {
          tournamentId: tournament.id,
          teamName: isTeamBased ? values.teamName : '',
          teamLogo: values.teamLogo,
          teamMembers: values.selectedMembers.map((m) => m.id),
          inGameNames: values.inGameNames,
        }

        await dispatch(joinTournament(joinData))
        actions.setSubmitting(false)
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => {
        const filteredPlayers = allPlayers
          .filter((player) => {
            const searchLower = searchTerm.toLowerCase()
            const playerName = (player.name || player.email || '').toLowerCase()
            return playerName.includes(searchLower)
          })
          .filter((player) => !values.selectedMembers.find((m) => m.id === player.id))

        const handleAddMember = (player) => {
          if (values.selectedMembers.length >= requiredMembers) {
            toast.warning(`Maximum ${requiredMembers} member${requiredMembers > 1 ? 's' : ''} allowed`)
            return
          }
          setFieldValue('selectedMembers', [...values.selectedMembers, player])
          // Initialize IGN field for the new member to prevent controlled/uncontrolled warning
          setFieldValue(`inGameNames.${player.id}`, '')
        }

        const handleRemoveMember = (playerId) => {
          const updatedMembers = values.selectedMembers.filter((m) => m.id !== playerId)
          const updatedIGN = { ...values.inGameNames }
          delete updatedIGN[playerId]
          setFieldValue('selectedMembers', updatedMembers)
          setFieldValue('inGameNames', updatedIGN)
        }

        return (
          <Form>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-[#0F172A] border border-[#1F2937] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 bg-[#0F172A] border-b border-[#1F2937] px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#E5E7EB]">
                      Join {tournament.name}
                    </h2>
                    <p className="text-[12px] text-[#9CA3AF] mt-1">
                      As the team captain, fill in your team details and select your teammates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-[#6B7280] hover:text-[#E5E7EB] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                  {!showIGNSection ? (
                    <>
                      {/* Captain Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-4 h-4 text-[#FCD34D]" />
                          <label className="text-[14px] font-semibold text-[#E5E7EB]">
                            Captain (You)
                          </label>
                        </div>
                        <div className="bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3">
                          <p className="text-[14px] text-[#E5E7EB]">{captainName}</p>
                        </div>
                      </div>

                      {/* Team Details - Only for Squad/Duo */}
                      {isTeamBased && (
                        <>
                          <div className="border-t border-[#1F2937] pt-6">
                            <h3 className="text-[16px] font-semibold text-[#E5E7EB] mb-4">
                              Team Details
                            </h3>

                            {/* Team Name */}
                            <div className="mb-4">
                              <label className="text-[14px] font-medium text-[#E5E7EB] mb-2 block">
                                Team Name <span className="text-[#EF4444]">*</span>
                              </label>
                              <Field
                                type="text"
                                name="teamName"
                                placeholder="Enter your team name"
                                className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                              />
                              <ErrorMessage
                                name="teamName"
                                component="p"
                                className="text-red-400 text-xs mt-1 ml-1"
                              />
                            </div>

                            {/* Team Logo */}
                            <div>
                              <label className="text-[14px] font-medium text-[#E5E7EB] mb-2 block">
                                Team Logo <span className="text-[#6B7280] text-[12px]">(Optional)</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  id="teamLogo"
                                  accept="image/*"
                                  onChange={(e) => handleLogoUpload(e, setFieldValue)}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="teamLogo"
                                  className="flex items-center justify-center w-full h-32 bg-[#111827] border-2 border-dashed border-[#1F2937] rounded-lg cursor-pointer hover:border-[#3B82F6] transition-colors"
                                >
                                  {logoPreview ? (
                                    <img
                                      src={logoPreview}
                                      alt="Team logo preview"
                                      className="h-full w-auto object-contain rounded-lg"
                                    />
                                  ) : (
                                    <div className="text-center">
                                      <Upload className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
                                      <p className="text-[12px] text-[#9CA3AF]">
                                        Drag & drop or click to upload
                                      </p>
                                      <p className="text-[10px] text-[#6B7280] mt-1">
                                        PNG, JPG up to 2MB
                                      </p>
                                    </div>
                                  )}
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Team Members */}
                          <div className="border-t border-[#1F2937] pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-[16px] font-semibold text-[#E5E7EB]">
                                Team Members
                              </h3>
                              <span className="text-[12px] text-[#9CA3AF]">
                                {values.selectedMembers.length}/{requiredMembers} selected
                              </span>
                            </div>

                            {/* Search Players */}
                            <div className="relative mb-4">
                              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                              <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search players by username..."
                                className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-11 pr-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                              />
                            </div>

                            {/* Available Players Dropdown */}
                            {searchTerm && (
                              <div className="mb-4 bg-[#111827] border border-[#1F2937] rounded-lg max-h-48 overflow-y-auto">
                                {loadingPlayers ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin" />
                                  </div>
                                ) : filteredPlayers.length > 0 ? (
                                  <div className="divide-y divide-[#1F2937]">
                                    {filteredPlayers.map((player) => (
                                      <button
                                        type="button"
                                        key={player.id}
                                        onClick={() => handleAddMember(player)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1F2937] transition-colors text-left"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-[11px] font-semibold">
                                          {getInitials(player.name || player.email)}
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[13px] text-[#E5E7EB]">
                                            {player.name || player.email}
                                          </p>
                                          {player.email && player.name && (
                                            <p className="text-[11px] text-[#6B7280]">{player.email}</p>
                                          )}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[12px] text-[#6B7280] text-center py-4">
                                    No players found
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Selected Members Display */}
                            <div className="min-h-30 bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                              {values.selectedMembers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-25 text-center">
                                  <UsersIcon className="w-10 h-10 text-[#374151] mb-2" />
                                  <p className="text-[12px] text-[#6B7280]">
                                    Search and select {requiredMembers} teammate{requiredMembers > 1 ? 's' : ''}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {values.selectedMembers.map((member) => (
                                    <div
                                      key={member.id}
                                      className="flex items-center justify-between bg-[#1F2937] rounded-lg px-3 py-2"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-[11px] font-semibold">
                                          {getInitials(member.name || member.email)}
                                        </div>
                                        <span className="text-[13px] text-[#E5E7EB]">
                                          {member.name || member.email}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-[#EF4444] hover:text-[#DC2626] text-[12px]"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <ErrorMessage
                              name="selectedMembers"
                              component="p"
                              className="text-red-400 text-xs mt-1 ml-1"
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* IGN Section - Shown after clicking continue */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-[16px] font-semibold text-[#E5E7EB]">
                            In-Game Names (IGN)
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowIGNSection(false)}
                            className="text-[12px] text-[#3B82F6] hover:text-[#2563EB]"
                          >
                            ← Back to Team Details
                          </button>
                        </div>
                        <p className="text-[12px] text-[#9CA3AF] mb-4">
                          Enter the in-game names for all team members
                        </p>

                        <div className="space-y-4">
                          {/* Captain IGN */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-3 h-3 text-[#FCD34D]" />
                              <label className="text-[13px] font-medium text-[#E5E7EB]">
                                {captainName} (Captain) <span className="text-[#EF4444]">*</span>
                              </label>
                            </div>
                            <Field
                              type="text"
                              name={`inGameNames.${captainId}`}
                              placeholder="Enter your in-game name"
                              className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                            />
                          </div>

                          {/* Team Members IGN */}
                          {values.selectedMembers.map((member) => (
                            <div key={member.id}>
                              <label className="text-[13px] font-medium text-[#E5E7EB] mb-2 block">
                                {member.name || member.email} <span className="text-[#EF4444]">*</span>
                              </label>
                              <Field
                                type="text"
                                name={`inGameNames.${member.id}`}
                                placeholder="Enter in-game name"
                                className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors"
                              />
                            </div>
                          ))}
                          <ErrorMessage
                            name="inGameNames"
                            component="p"
                            className="text-red-400 text-xs mt-1 ml-1"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Entry Fee & Balance */}
                  {!showIGNSection && (
                    <div className="border-t border-[#1F2937] pt-6">
                      <div className="bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] text-[#9CA3AF]">Entry Fee</span>
                          <span className="text-[14px] font-semibold text-[#E5E7EB]">
                            {entryFee} Coins
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] text-[#9CA3AF]">Your Balance</span>
                          <span
                            className={`text-[14px] font-semibold ${
                              userBalance >= entryFee ? 'text-[#22C55E]' : 'text-[#EF4444]'
                            }`}
                          >
                            {userBalance} Coins
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-[#0F172A] border-t border-[#1F2937] px-6 py-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={joinLoading}
                    className="flex-1 bg-[#111827] hover:bg-[#1F2937] text-[#E5E7EB] font-semibold py-3 px-4 rounded-lg text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || joinLoading || (showIGNSection && userBalance < entryFee)}
                    className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-3 px-4 rounded-lg text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {joinLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <span>{!showIGNSection ? 'Continue' : 'Join Tournament'}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default JoinTournament
