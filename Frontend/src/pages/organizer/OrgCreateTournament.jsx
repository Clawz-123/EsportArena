import React, {  useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { toast } from 'react-toastify'
import { Calendar, ChevronDown } from 'lucide-react'
import OrgSidebar from './OrgSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { tournamentValidationSchema } from '../utils/organizerCreateFromValidation'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createTournament, clearError, clearSuccess } from '../../slices/tournamentSlice'

const OrgCreateTournament = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
  const { createLoading, createError } = useAppSelector(
    (state) => state.tournament
  )

  const initialValues = {
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
    requireResultProof: false,
    proofType: 'Screenshot Only',
    resultTimeLimit: '24',
    visibility: 'Public',
    autoStartTournament: false,
    isDraft: false,
  }

  const calculateTotalPrize = (values) => {
    return (
      (parseInt(values.prizeFirst) || 0) +
      (parseInt(values.prizeSecond) || 0) +
      (parseInt(values.prizeThird) || 0)
    )
  }

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
      require_result_proof: values.requireResultProof,
      proof_type: values.proofType,
      result_time_limit_hours: parseInt(values.resultTimeLimit),
      visibility: values.visibility,
      auto_start_tournament: values.autoStartTournament,
      is_draft: values.isDraft,
    }

    try {
      const result = await dispatch(createTournament(payload))
      if (createTournament.fulfilled.match(result)) {
        toast.success('Tournament created successfully!')
        actions.resetForm()
        navigate('/OrgTournaments')
      }
    } catch (error) {
      console.error('Tournament creation error:', error)
    }
  }

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearSuccess())
    }
  }, [dispatch])

  useEffect(() => {
    if (createError) {
      const errorMessage =
        createError?.error_message ||
        createError?.Error_Message ||
        createError?.message ||
        'Failed to create tournament'
      toast.error(
        typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      )
    }
  }, [createError])

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
          <Formik
            initialValues={initialValues}
            validationSchema={tournamentValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form className="max-w-2xl mx-auto p-6 space-y-6">
              {/* SECTION 1: Basic Information */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
                <h2 className="text-base font-semibold text-[#E5E7EB]">Basic Information</h2>

                {/* Tournament Name */}
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Tournament Name <span className="text-red-400">*</span>
                  </label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Enter tournament name"
                    className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                      touched.name && errors.name ? 'border-red-400' : 'border-[#1F2937]'
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
                        className={`appearance-none w-full bg-[#0F172A] border rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer ${
                          touched.gameTitle && errors.gameTitle ? 'border-red-400' : 'border-[#1F2937]'
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
                        className={`appearance-none w-full bg-[#0F172A] border rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer ${
                          touched.matchFormat && errors.matchFormat ? 'border-red-400' : 'border-[#1F2937]'
                        }`}
                      >
                        <option value="">Select format</option>
                        <option value="Solo">Solo</option>
                        <option value="Duo">Duo</option>
                        <option value="Squad">Squad</option>
                      </Field>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
                    <ErrorMessage name="matchFormat" component="p" className="text-red-400 text-xs mt-1" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Description (Optional)
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    placeholder="Enter tournament description, rules overview, etc."
                    rows="4"
                    className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none ${
                      touched.description && errors.description ? 'border-red-400' : 'border-[#1F2937]'
                    }`}
                  />
                  <ErrorMessage name="description" component="p" className="text-red-400 text-xs mt-1" />
                </div>
              </div>

              {/* SECTION 2: Schedule & Registration */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
                <h2 className="text-base font-semibold text-[#E5E7EB]">Schedule & Registration</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                      Registration Start <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Field
                        type="date"
                        name="registrationStart"
                        className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.registrationStart && errors.registrationStart ? 'border-red-400' : 'border-[#1F2937]'
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
                        className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.registrationEnd && errors.registrationEnd ? 'border-red-400' : 'border-[#1F2937]'
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
                        className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.matchStart && errors.matchStart ? 'border-red-400' : 'border-[#1F2937]'
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
                        className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.expectedEnd && errors.expectedEnd ? 'border-red-400' : 'border-[#1F2937]'
                        }`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    </div>
                    <ErrorMessage name="expectedEnd" component="p" className="text-red-400 text-xs mt-1" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Tournament Structure */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
                <h2 className="text-base font-semibold text-[#E5E7EB]">Tournament Structure</h2>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Maximum Participants / Teams <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      name="maxParticipants"
                      className={`appearance-none w-full bg-[#0F172A] border rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer ${
                        touched.maxParticipants && errors.maxParticipants ? 'border-red-400' : 'border-[#1F2937]'
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
                    Entry Fee (Coins) <span className="text-red-400">*</span>
                  </label>
                  <Field
                    type="number"
                    name="entryFee"
                    min="0"
                    className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                      touched.entryFee && errors.entryFee ? 'border-red-400' : 'border-[#1F2937]'
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
                        className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.prizeFirst && errors.prizeFirst ? 'border-red-400' : 'border-[#1F2937]'
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
                        className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.prizeSecond && errors.prizeSecond ? 'border-red-400' : 'border-[#1F2937]'
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
                        className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                          touched.prizeThird && errors.prizeThird ? 'border-red-400' : 'border-[#1F2937]'
                        }`}
                      />
                      <ErrorMessage name="prizeThird" component="p" className="text-red-400 text-xs mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#1F2937]">
                  <span className="text-sm font-medium text-[#E5E7EB]">Total Prize Pool</span>
                  <span className="text-sm font-semibold text-[#3B82F6]">{calculateTotalPrize(values)} Coins</span>
                </div>
              </div>

              {/* SECTION 5: Match Rules & Result Settings */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 space-y-5">
                <h2 className="text-base font-semibold text-[#E5E7EB]">Match Rules & Result Settings</h2>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Match Rules (Optional)
                  </label>
                  <Field
                    as="textarea"
                    name="matchRules"
                    placeholder="Enter rules, restrictions, or guidelines"
                    rows="4"
                    className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none ${
                      touched.matchRules && errors.matchRules ? 'border-red-400' : 'border-[#1F2937]'
                    }`}
                  />
                  <ErrorMessage name="matchRules" component="p" className="text-red-400 text-xs mt-1" />
                </div>

                <div className="flex items-center gap-3">
                  <Field
                    type="checkbox"
                    id="requireResultProof"
                    name="requireResultProof"
                    className="w-4 h-4 rounded bg-[#0F172A] border border-[#1F2937] cursor-pointer accent-[#3B82F6]"
                  />
                  <label htmlFor="requireResultProof" className="text-sm text-[#E5E7EB] cursor-pointer">
                    Require result proof for verification
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Accepted Proof Type <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      name="proofType"
                      className={`appearance-none w-full bg-[#0F172A] border rounded-md px-4 py-2.5 pr-10 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer ${
                        touched.proofType && errors.proofType ? 'border-red-400' : 'border-[#1F2937]'
                      }`}
                    >
                      <option value="Screenshot Only">Screenshot Only</option>
                    </Field>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                  <ErrorMessage name="proofType" component="p" className="text-red-400 text-xs mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">
                    Result Submission Time Limit (Hours) <span className="text-red-400">*</span>
                  </label>
                  <Field
                    type="number"
                    name="resultTimeLimit"
                    min="1"
                    className={`w-full bg-[#0F172A] border rounded-md px-4 py-2.5 text-[14px] text-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                      touched.resultTimeLimit && errors.resultTimeLimit ? 'border-red-400' : 'border-[#1F2937]'
                    }`}
                  />
                  <ErrorMessage name="resultTimeLimit" component="p" className="text-red-400 text-xs mt-1" />
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
                    Tournament Visibility <span className="text-red-400">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Field
                        type="radio"
                        id="public"
                        name="visibility"
                        value="Public"
                        className="w-4 h-4 cursor-pointer accent-[#3B82F6]"
                      />
                      <label htmlFor="public" className="text-sm text-[#E5E7EB] cursor-pointer">
                        Public – listed in tournament directory
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Field
                        type="radio"
                        id="private"
                        name="visibility"
                        value="Private"
                        className="w-4 h-4 cursor-pointer accent-[#3B82F6]"
                      />
                      <label htmlFor="private" className="text-sm text-[#E5E7EB] cursor-pointer">
                        Private – invite only
                      </label>
                    </div>
                  </div>
                  <ErrorMessage name="visibility" component="p" className="text-red-400 text-xs mt-1" />
                </div>

                <div className="flex items-center gap-3">
                  <Field
                    type="checkbox"
                    id="autoStartTournament"
                    name="autoStartTournament"
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
                  disabled={createLoading || isSubmitting}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-8 py-2.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Creating...' : 'Create Tournament'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Set isDraft to true and submit the form
                  }}
                  disabled={createLoading || isSubmitting}
                  className="bg-transparent border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 font-semibold px-8 py-2.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
            </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default OrgCreateTournament
