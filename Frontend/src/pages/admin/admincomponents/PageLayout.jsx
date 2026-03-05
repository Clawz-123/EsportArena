import React from 'react'
import AdminSidebar from '../AdminSidebar'
import ProfileMenu from '../../../components/common/ProfileMenu'

// Layout component for admin pages with sidebar, header, and content area
const AdminPageLayout = ({ title, subtitle, headerRight, children }) => (
  <div className="flex h-screen bg-[#0F172A]">
    <AdminSidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E5E7EB]">{title}</h1>
          {subtitle && <p className="text-sm text-[#9CA3AF] mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {headerRight}
          <ProfileMenu />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  </div>
)

export default AdminPageLayout
