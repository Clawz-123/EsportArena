import React, { useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { createResult } from '../../../slices/resultSlice'

const ResultCard = ({ tournament }) => {
  const dispatch = useAppDispatch()
  const { createLoading } = useAppSelector((state) => state.result || {})
  const [matchId, setMatchId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [file, setFile] = useState(null)

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

  const handleSubmit = async () => {
    if (!tournament?.id) {
      toast.error('Tournament not found')
      return
    }

    if (!matchId || Number.isNaN(Number(matchId))) {
      toast.error('Please enter a valid match id')
      return
    }

    if (!groupName.trim()) {
      toast.error('Please enter a group name')
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
      const errorMessage =
        result.payload?.Error_Message ||
        result.payload?.error_message ||
        result.payload?.message ||
        'Failed to submit result'
      toast.error(
        typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
      )
    }
  }

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-8">
      <h3 className="text-lg font-bold text-white mb-6">
        Submit Match Result
      </h3>

      <div className="space-y-6">
        {/* Match ID and Group Name Row */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-gray-400">Match Id</label>
            <input
              type="text"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="w-full bg-[#0B1220] border-none rounded-md px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#2563EB] placeholder-gray-600"
              placeholder="0"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-gray-400">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-[#0B1220] border-none rounded-md px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#2563EB] placeholder-gray-600"
              placeholder="A"
            />
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
          disabled={createLoading}
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
