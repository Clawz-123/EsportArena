import React from 'react'

const UserAvatar = ({ user, size = 'md' }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-xs', border: 'border border-[#1F2937]' },
    md: { container: 'w-9 h-9', text: 'text-xs', border: 'border border-[#374151]' },
    lg: { container: 'w-20 h-20', text: 'text-2xl', border: 'border-4 border-[#111827]' },
  }
  const s = sizes[size] || sizes.md
  const initial = (user?.name || user?.email || '?')[0].toUpperCase()

  if (user?.profile_image) {
    return (
      <img
        src={user.profile_image}
        alt={user.name || ''}
        className={`${s.container} rounded-full object-cover ${s.border} shrink-0`}
      />
    )
  }

  return (
    <div className={`${s.container} rounded-full bg-[#1F2937] flex items-center justify-center ${s.text} font-bold text-[#9CA3AF] ${s.border} shrink-0`}>
      {initial}
    </div>
  )
}

export default UserAvatar
