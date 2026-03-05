import React from 'react'
import { Trash2 } from 'lucide-react'

const ConfirmModal = ({ open, onClose, onConfirm, loading, title = 'Confirm Delete', subtitle = 'This action cannot be undone', message, icon: Icon = Trash2, confirmLabel = 'Delete', children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !loading && onClose()}>
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-red-500/10">
            <Icon className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-[#E5E7EB] font-semibold">{title}</h3>
            <p className="text-xs text-[#6B7280]">{subtitle}</p>
          </div>
        </div>
        {message && <p className="text-sm text-[#9CA3AF] mb-1">{message}</p>}
        {children && <div className="mb-5">{children}</div>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#1F2937] text-sm text-[#E5E7EB] hover:bg-[#374151] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-sm text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Icon className="w-3.5 h-3.5" /> {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
