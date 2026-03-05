import React from 'react'
import { X } from 'lucide-react'

const AdminModal = ({ open, onClose, children, maxWidth = 'max-w-md' }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-[#111827] border border-[#1F2937] rounded-2xl w-full ${maxWidth} mx-4 overflow-hidden max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export const ModalCloseButton = ({ onClick }) => (
  <button onClick={onClick} className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#1F2937]/60 text-[#9CA3AF] hover:text-white transition-colors">
    <X className="w-4 h-4" />
  </button>
)

export const ModalInfoRow = ({ label, children }) => (
  <div className="bg-[#0F172A] rounded-lg p-3">
    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">{label}</p>
    <div className="text-sm text-[#E5E7EB]">{children}</div>
  </div>
)

export default AdminModal
