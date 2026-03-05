import React from 'react'
import { Search } from 'lucide-react'

// Reusable search bar component for admin pages with optional filter dropdown and result count
const AdminSearchBar = ({ value, onChange, placeholder = 'Search...', filterValue, onFilterChange, filterOptions, resultCount }) => (
  <div className="flex items-center gap-3">
    <div className="relative max-w-sm flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-blue-500/40"
      />
    </div>
    {filterOptions && (
      <select
        value={filterValue}
        onChange={onFilterChange}
        className="px-4 py-2.5 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-[#E5E7EB] focus:outline-none focus:border-blue-500/40 cursor-pointer"
      >
        {filterOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )}
    {resultCount !== undefined && (
      <span className="text-xs text-[#6B7280]">
        {resultCount} result{resultCount !== 1 ? 's' : ''}
      </span>
    )}
  </div>
)

export default AdminSearchBar
