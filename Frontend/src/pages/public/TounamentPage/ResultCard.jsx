import React, { useEffect, useMemo, useState } from 'react'
import { Upload, ChevronDown } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createResult } from '../../../slices/resultSlice'
import { fetchMatchesByTournament } from '../../../slices/MatchSlice'

const ResultCard = ({ tournament }) => {
  const dispatch = useAppDispatch()
  const { createLoading } = useAppSelector((state) => state.result || {})
  const { matches, loading: matchesLoading } = useAppSelector((state) => state.match || {})
  const [matchId, setMatchId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (tournament?.id) {
      dispatch(fetchMatchesByTournament(tournament.id))
    }
  }, [dispatch, tournament?.id])

  const selectedMatch = useMemo(() => {
    const id = Number(matchId)
    if (!id) return null
    return (matches || []).find((match) => match.id === id) || null
  }, [matches, matchId])

  const groupOptions = useMemo(() => {
    if (selectedMatch?.group) {
      return [selectedMatch.group]
    }
    return Array.from(new Set((matches || []).map((match) => match.group).filter(Boolean)))
  }, [matches, selectedMatch])

  useEffect(() => {
    if (selectedMatch?.group) {
      setGroupName(selectedMatch.group)
    }
  }, [selectedMatch])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const formatErrorMessage = (error, fallback = 'Failed to submit result') => {
    if (!error) return fallback
    if (typeof error === 'string') return error

    if (error.non_field_errors && Array.isArray(error.non_field_errors)) {
      return error.non_field_errors.join(' ')
    }

    if (error.Error_Message) {
      if (typeof error.Error_Message === 'string') return error.Error_Message
      if (error.Error_Message.non_field_errors) {
        return error.Error_Message.non_field_errors.join(' ')
      }
      const values = Object.values(error.Error_Message)
      if (Array.isArray(values)) return values.flat().join(' ')
    }

    if (error.error_message) return error.error_message
    if (error.message) return error.message

    return fallback
  }

  const handleSubmit = async () => {
    if (!tournament?.id) {
      toast.error('Tournament not found')
      return
    }

    if (!matchId || Number.isNaN(Number(matchId))) {
      toast.error('Please select a match')
      return
    }

    if (!groupName.trim()) {
      toast.error('Please select a group')
      return
    }

    if (selectedMatch?.status === 'Completed') {
      toast.error('This match is completed. Result submission is closed.')
      return
    }

    if (!file) {
      toast.error('Please upload a screenshot proof')
      return
    }

    const result = await dispatch(
      createResult({
        tournament: tournament.id,
        match: Number(matchId),
        group_name: groupName.trim(),
        proof_image: file,
      })
    )

    if (createResult.fulfilled.match(result)) {
      toast.success('Result submitted successfully')
      setMatchId('')
      setGroupName('')
      setFile(null)
    } else {
      toast.error(formatErrorMessage(result.payload))
    }
  }

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-8">
      <h3 className="text-lg font-bold text-white mb-6">
        Submit Match Result
      </h3>

      <div className="space-y-6">
        {/* Match and Group */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-gray-400">Match</label>
            <div className="relative">
              <select
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1F2937] rounded-md px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-[#2563EB] appearance-none"
              >
                <option value="">Select match</option>
                {(matches || []).map((match) => (
                  <option key={match.id} value={match.id}>
                    Match {match.match_number || match.id}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            {matchesLoading && (
              <p className="text-xs text-gray-500">Loading matches...</p>
            )}
            {selectedMatch?.status === 'Completed' && (
              <p className="text-xs text-rose-400">This match is completed. Submission closed.</p>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-gray-400">Group</label>
            <div className="relative">
              <select
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1F2937] rounded-md px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-[#2563EB] appearance-none"
                disabled={!matchId && groupOptions.length === 0}
              >
                <option value="">Select group</option>
                {groupOptions.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Screenshot Proof */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Screenshot Proof</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border border-dashed border-[#374151] rounded-lg bg-[#111827]/50 hover:bg-[#1F2937]/30 transition-colors h-40 flex flex-col items-center justify-center cursor-pointer relative"
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
            />
            {file ? (
              <div className="text-center">
                <p className="text-sm text-white font-medium">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-10 h-10 bg-[#1F2937] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-300 font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={createLoading || selectedMatch?.status === 'Completed'}
          onClick={handleSubmit}
          className="w-full bg-[#374151] hover:bg-[#4B5563] text-gray-200 font-medium py-3 rounded-lg transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {createLoading ? 'Submitting...' : 'Submit Result'}
        </button>
      </div>
    </div>
  )
}

export default ResultCard
