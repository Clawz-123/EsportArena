import React from 'react'
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react'

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger', // 'danger', 'warning', 'success', 'info'
  icon = null, // If null, uses default icon based on variant
}) => {
  if (!isOpen) return null

  const getDefaultIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'info':
        return <AlertCircle className="w-6 h-6 text-blue-500" />
      default:
        return <AlertCircle className="w-6 h-6 text-red-500" />
    }
  }

  const getButtonColor = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      case 'success':
        return 'bg-green-600 hover:bg-green-700'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700'
      default:
        return 'bg-red-600 hover:bg-red-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {icon || getDefaultIcon()}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[#E5E7EB] mb-3 text-center">{title}</h3>

        {/* Message */}
        <p className="text-sm text-[#9CA3AF] mb-6 text-center">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-[#1F2937] hover:bg-[#2D3748] disabled:opacity-50 disabled:cursor-not-allowed text-[#E5E7EB] font-medium rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
