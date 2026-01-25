import React from 'react'

const BracketCard = () => {
  return (
    <div className="bg-[#1E293B] border border-[#2D3748] rounded-lg p-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-[#2D3748] rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Tournament Bracket</h3>
        <p className="text-[#9CA3AF] text-sm max-w-md mx-auto">
          The tournament bracket will be generated once registration closes and participants are finalized.
        </p>
        <button className="mt-4 px-6 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors font-medium">
          Generate Bracket
        </button>
      </div>
    </div>
  )
}

export default BracketCard