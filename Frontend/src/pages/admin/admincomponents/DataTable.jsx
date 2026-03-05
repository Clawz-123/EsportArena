import React from 'react'
import Pagination from '../../../components/Pagination/Pagination'

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

// Reusable admin table component with loading, empty state, and pagination
const AdminTable = ({ loading, headers, children, emptyIcon: EmptyIcon, emptyText = 'No data found', currentPage, totalPages, onPageChange }) => (
  <>
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1F2937]">
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3.5 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider ${h.align === 'right' ? 'text-right' : h.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {React.Children.count(children) > 0 ? (
                children
              ) : (
                <tr>
                  <td colSpan={headers.length} className="px-5 py-12 text-center">
                    {EmptyIcon && <EmptyIcon className="w-8 h-8 text-[#374151] mx-auto mb-2" />}
                    <p className="text-sm text-[#6B7280]">{emptyText}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    {totalPages > 1 && (
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    )}
  </>
)

export default AdminTable
