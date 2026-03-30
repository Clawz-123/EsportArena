import React, { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { toast } from 'react-toastify'
import { Calendar, ChevronDown } from 'lucide-react'
import OrgSidebar from './OrgSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { tournamentValidationSchema } from '../utils/organizerCreateFromValidation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  createTournament,
  updateTournament,
  fetchTournamentDetail,
  clearError,
  clearSuccess,
} from '../../slices/tournamentSlice'

const defaultInitialValues = {
  name: '',
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
  autoStartTournament: false,
}

// Component for the tournament creation page for organizers
const OrgCreateTournament = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const editTournamentId = searchParams.get('editId')
  const parsedEditTournamentId = editTournamentId ? Number(editTournamentId) : null
  const isEditMode = Boolean(parsedEditTournamentId)
  
  const { createLoading, createError, updateLoading, updateError, currentTournament } = useAppSelector(
    (state) => state.tournament
  )

  const isRegistrationOpen = (tournament) => {
    if (!tournament?.registration_start || !tournament?.registration_end) {
      return false
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const registrationStart = new Date(tournament.registration_start)
    registrationStart.setHours(0, 0, 0, 0)

    const registrationEnd = new Date(tournament.registration_end)
    registrationEnd.setHours(0, 0, 0, 0)

    return now >= registrationStart && now <= registrationEnd
  }

  const editTournament =
    isEditMode && currentTournament?.id === parsedEditTournamentId ? currentTournament : null

  const initialValues = useMemo(() => {
    if (!isEditMode || !editTournament) {
      return defaultInitialValues
    }

    return {
      name: editTournament.name || '',
      gameTitle: editTournament.game_title || '',
      matchFormat: editTournament.match_format || '',
      description: editTournament.description || '',
      registrationStart: editTournament.registration_start || '',
      registrationEnd: editTournament.registration_end || '',
      matchStart: editTournament.match_start || '',
      expectedEnd: editTournament.expected_end || '',
      maxParticipants: editTournament.max_participants ? String(editTournament.max_participants) : '',
      autoGenerateBracket: Boolean(editTournament.auto_generate_bracket),
      entryFee: String(editTournament.entry_fee ?? 0),
      prizeFirst: String(editTournament.prize_first ?? 0),
      prizeSecond: String(editTournament.prize_second ?? 0),
      prizeThird: String(editTournament.prize_third ?? 0),
      matchRules: editTournament.match_rules || '',
      autoStartTournament: Boolean(editTournament.auto_start_tournament),
    }
  }, [editTournament, isEditMode])

  // Created a helper function to calculate the total prize 
  const calculateTotalPrize = (values) => {
    return (
      (parseInt(values.prizeFirst) || 0) +
      (parseInt(values.prizeSecond) || 0) +
      (parseInt(values.prizeThird) || 0)
    )
  }

  // Handling the form submission by dispatching create/update tournament thunks based on mode
  const handleSubmit = async (values, actions) => {
    const payload = {
      name: values.name,
      game_title: values.gameTitle,
      match_format: values.matchFormat, 
      description: values.description,
      registration_start: values.registrationStart,
      registration_end: values.registrationEnd,
      match_start: values.matchStart,
      expected_end: values.expectedEnd || null,
      max_participants: parseInt(values.maxParticipants),
      auto_generate_bracket: values.autoGenerateBracket,
      entry_fee: parseInt(values.entryFee),
      prize_first: parseInt(values.prizeFirst),
      prize_second: parseInt(values.prizeSecond),
      prize_third: parseInt(values.prizeThird),
      match_rules: values.matchRules,
      auto_start_tournament: values.autoStartTournament,
    }

    // Dispatching create/update tournament action and handling the result
    try {
      const result = isEditMode
        ? await dispatch(
            updateTournament({
              tournamentId: parsedEditTournamentId,
              tournamentData: payload,
            })
          )
        : await dispatch(createTournament(payload))

      const isSuccess = isEditMode
        ? updateTournament.fulfilled.match(result)
        : createTournament.fulfilled.match(result)

      if (isSuccess) {
        toast.success(isEditMode ? 'Tournament updated successfully!' : 'Tournament created successfully!')
        if (isEditMode) {
          navigate(`/organizer/tournaments/${parsedEditTournamentId}`)
        } else {
          actions.resetForm()
          navigate('/Orgtournaments')
        }
      } else {
        const errorMessage =
          result.payload?.error_message ||
          result.payload?.Error_Message ||
          result.payload?.message ||
          (isEditMode ? 'Failed to update tournament' : 'Failed to create tournament')
        toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
      }
    } catch (error) {
      console.error('Tournament submit error:', error)
      toast.error(isEditMode ? 'Failed to update tournament' : 'Failed to create tournament')
    } finally {
      actions.setSubmitting(false)
    }
  }

  useEffect(() => {
    if (isEditMode && parsedEditTournamentId) {
      dispatch(fetchTournamentDetail(parsedEditTournamentId))
    }
  }, [dispatch, isEditMode, parsedEditTournamentId])

  useEffect(() => {
    if (!isEditMode || !editTournament) return

    if (!isRegistrationOpen(editTournament)) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const registrationEnd = new Date(editTournament.registration_end)
      registrationEnd.setHours(0, 0, 0, 0)

      const hasRegistrationEnded = today > registrationEnd
      if (hasRegistrationEnded) {
        toast.error('Registration ended. Tournament cannot be edited.')
      } else {
        toast.error('Only registration-open tournaments can be edited.')
      }
      navigate(`/organizer/tournaments/${editTournament.id}`, { replace: true })
    }
  }, [editTournament, isEditMode, navigate])

  // Using useEffect to clear any existing errors or success messages
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearSuccess())
    }
  }, [dispatch])

  // Using useEffect to show error messages if tournament create/update fails
  useEffect(() => {
    const formError = isEditMode ? updateError : createError
    if (formError) {
      const errorMessage =
        formError?.error_message ||
        formError?.Error_Message ||
        formError?.message ||
        (isEditMode ? 'Failed to update tournament' : 'Failed to create tournament')
      toast.error(
        typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      )
    }
  }, [createError, isEditMode, updateError])

  return (
    <div className="flex min-h-screen bg-[#0B1020] text-[#E5E7EB]">
      {/* Sidebar */}
      <OrgSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0B1020]/80 border-b border-white/10 px-8 py-6 flex items-center justify-between backdrop-blur">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#F8FAFC]">
              {isEditMode ? 'Edit Tournament' : 'Create Tournament'}
            </h1>
            <p className="text-sm text-[#94A3B8] mt-2">
              {isEditMode
                ? 'Update your tournament settings while registration is open.'
                : 'Build a new bracket in a few steps.'}
            </p>
          </div>
          <ProfileMenu />
        </header>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <Formik
            initialValues={initialValues}
            validationSchema={tournamentValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form className="w-full px-8 py-8">
                <div className="space-y-8">
              {/* SECTION 1: Basic Information */}
              <div className="bg-linear-to-br from-[#0E1628] via-[#0E1628] to-[#0B1222] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  <h2 className="text-base font-semibold text-[#F8FAFC]">Basic Information</h2>
                </div>
                <p className="text-xs text-[#94A3B8]">Name, game, and overview.</p>

                {/* Tournament Name */}
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Tournament Name <span className="text-red-400">*</span>
                  </label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Enter tournament name"
                    className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                      touched.name && errors.name ? 'border-red-400' : 'border-white/10'
                    }`}
                  />
                  <ErrorMessage name="name" component="p" className="text-red-400 text-xs mt-1" />
                </div>

                {/* Game Title & Match Format */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                      Game Title <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        as="select"
                        name="gameTitle"
                        className={`appearance-none w-full bg-[#0B1120] border rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer ${
                          touched.gameTitle && errors.gameTitle ? 'border-red-400' : 'border-white/10'
                        }`}
                      >
                        <option value="">Select game</option>
                        <option value="PUBG Mobile">PUBG Mobile</option>
                        <option value="Free Fire">Free Fire</option>
                      </Field>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
                    <ErrorMessage name="gameTitle" component="p" className="text-red-400 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                      Match Format <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        as="select"
                        name="matchFormat"
                        className={`appearance-none w-full bg-[#0B1120] border rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer ${
                          touched.matchFormat && errors.matchFormat ? 'border-red-400' : 'border-white/10'
                        }`}
                      >
                        <option value="">Select format</option>
                        <option value="Solo">Solo (1 player)</option>
                        <option value="Duo">Duo (2 players)</option>
                        <option value="Squad">Squad (4 players)</option>
                      </Field>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
               
                    
                    <ErrorMessage name="matchFormat" component="p" className="text-red-400 text-xs mt-1" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    placeholder="Enter tournament description, rules overview, etc. (minimum 50 words)"
                    rows="4"
                    className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none ${
                      touched.description && errors.description ? 'border-red-400' : 'border-white/10'
                    }`}
                  />
                  <ErrorMessage name="description" component="p" className="text-red-400 text-xs mt-1" />
                </div>
              </div>

              {/* SECTION 2: Schedule & Registration */}
              <div className="bg-linear-to-br from-[#0E1628] via-[#0E1628] to-[#0B1222] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.7)]" />
                  <h2 className="text-base font-semibold text-[#F8FAFC]">Schedule & Registration</h2>
                </div>
                <p className="text-xs text-[#94A3B8]">Set key dates and registration windows.</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                      Registration Start <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        type="date"
                        name="registrationStart"
                        className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.registrationStart && errors.registrationStart ? 'border-red-400' : 'border-white/10'
                        }`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
                    <ErrorMessage name="registrationStart" component="p" className="text-red-400 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                      Registration End <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        type="date"
                        name="registrationEnd"
                        className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.registrationEnd && errors.registrationEnd ? 'border-red-400' : 'border-white/10'
                        }`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
                    <ErrorMessage name="registrationEnd" component="p" className="text-red-400 text-xs mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                      Match Start <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        type="date"
                        name="matchStart"
                        className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.matchStart && errors.matchStart ? 'border-red-400' : 'border-white/10'
                        }`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
                    <ErrorMessage name="matchStart" component="p" className="text-red-400 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                      Expected End
                    </label>
                    <div className="relative">
                      <Field
                        type="date"
                        name="expectedEnd"
                        className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.expectedEnd && errors.expectedEnd ? 'border-red-400' : 'border-white/10'
                        }`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
                    <ErrorMessage name="expectedEnd" component="p" className="text-red-400 text-xs mt-1" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Tournament Structure */}
              <div className="bg-linear-to-br from-[#0E1628] via-[#0E1628] to-[#0B1222] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.7)]" />
                  <h2 className="text-base font-semibold text-[#F8FAFC]">Tournament Structure</h2>
                </div>
                <p className="text-xs text-[#94A3B8]">Capacity limits and bracket setup.</p>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Maximum Participants / Teams <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      name="maxParticipants"
                      className={`appearance-none w-full bg-[#0B1120] border rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer ${
                        touched.maxParticipants && errors.maxParticipants ? 'border-red-400' : 'border-white/10'
                      }`}
                    >
                      <option value="">Select capacity</option>
                      <option value="8">8</option>
                      <option value="16">16</option>
                      <option value="32">32</option>
                      <option value="64">64</option>
                      <option value="128">128</option>
                    </Field>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                  <ErrorMessage name="maxParticipants" component="p" className="text-red-400 text-xs mt-1" />
                </div>

                <div className="flex items-center gap-3">
                  <Field
                    type="checkbox"
                    id="autoGenerateBracket"
                    name="autoGenerateBracket"
                    className="w-4 h-4 rounded bg-[#0B1120] border border-white/10 cursor-pointer accent-[#3B82F6]"
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
              <div className="bg-linear-to-br from-[#0E1628] via-[#0E1628] to-[#0B1222] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#34D399] shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                  <h2 className="text-base font-semibold text-[#F8FAFC]">Entry Fee & Prize Pool</h2>
                </div>
                <p className="text-xs text-[#94A3B8]">Define fees and prize distribution.</p>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Entry Fee (Coins) <span className="text-red-400">*</span>
                  </label>
                  <Field
                    type="number"
                    name="entryFee"
                    min="0"
                    className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                      touched.entryFee && errors.entryFee ? 'border-red-400' : 'border-white/10'
                    }`}
                  />
                  <ErrorMessage name="entryFee" component="p" className="text-red-400 text-xs mt-1" />
                  <p className="text-xs text-[#6B7280] mt-1">Set to 0 for free entry</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-3">
                    Prize Distribution (Coins) <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[#9CA3AF] mb-2">1st Place</label>
                      <Field
                        type="number"
                        name="prizeFirst"
                        min="0"
                        className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.prizeFirst && errors.prizeFirst ? 'border-red-400' : 'border-white/10'
                        }`}
                      />
                      <ErrorMessage name="prizeFirst" component="p" className="text-red-400 text-xs mt-1" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#9CA3AF] mb-2">2nd Place</label>
                      <Field
                        type="number"
                        name="prizeSecond"
                        min="0"
                        className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.prizeSecond && errors.prizeSecond ? 'border-red-400' : 'border-white/10'
                        }`}
                      />
                      <ErrorMessage name="prizeSecond" component="p" className="text-red-400 text-xs mt-1" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#9CA3AF] mb-2">3rd Place</label>
                      <Field
                        type="number"
                        name="prizeThird"
                        min="0"
                        className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.prizeThird && errors.prizeThird ? 'border-red-400' : 'border-white/10'
                        }`}
                      />
                      <ErrorMessage name="prizeThird" component="p" className="text-red-400 text-xs mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-sm font-medium text-[#E5E7EB]">Total Prize Pool</span>
                  <span className="text-sm font-semibold text-[#3B82F6]">{calculateTotalPrize(values)} Coins</span>
                </div>
              </div>

              {/* SECTION 5: Match Rules & Result Settings */}
              <div className="bg-linear-to-br from-[#0E1628] via-[#0E1628] to-[#0B1222] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#F472B6] shadow-[0_0_10px_rgba(244,114,182,0.7)]" />
                  <h2 className="text-base font-semibold text-[#F8FAFC]">Match Rules & Result Settings</h2>
                </div>
                <p className="text-xs text-[#94A3B8]">Match guidelines and rules.</p>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Match Rules (Optional)
                  </label>
                  <Field
                    as="textarea"
                    name="matchRules"
                    placeholder="Enter rules, restrictions, or guidelines"
                    rows="4"
                    className={`w-full bg-[#0B1120] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none ${
                      touched.matchRules && errors.matchRules ? 'border-red-400' : 'border-white/10'
                    }`}
                  />
                  <ErrorMessage name="matchRules" component="p" className="text-red-400 text-xs mt-1" />
                </div>

              </div>

              {/* SECTION 6: Control */}
              <div className="bg-linear-to-br from-[#0E1628] via-[#0E1628] to-[#0B1222] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#60A5FA] shadow-[0_0_10px_rgba(96,165,250,0.7)]" />
                  <h2 className="text-base font-semibold text-[#F8FAFC]">Control</h2>
                </div>
                <p className="text-xs text-[#94A3B8]">Configure tournament automation settings.</p>

                <div className="flex items-center gap-3">
                  <Field
                    type="checkbox"
                    id="autoStartTournament"
                    name="autoStartTournament"
                    className="w-4 h-4 rounded bg-[#0B1120] border border-white/10 cursor-pointer accent-[#3B82F6]"
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
              <div className="flex flex-wrap gap-4 justify-start pb-6">
                <button
                  type="submit"
                  disabled={createLoading || updateLoading || isSubmitting}
                  className="bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0B1020] font-semibold px-8 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createLoading || updateLoading
                    ? (isEditMode ? 'Updating...' : 'Creating...')
                    : (isEditMode ? 'Update Tournament' : 'Create Tournament')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/Orgtournaments')}
                  className="text-[#94A3B8] hover:text-[#E2E8F0] font-medium px-6 py-2.5 transition-colors"
                >
                  Cancel
                </button>
              </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default OrgCreateTournament
