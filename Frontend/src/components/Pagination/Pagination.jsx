import React from 'react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	if (!totalPages || totalPages <= 1) {
		return null
	}

	const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

	return (
		<div className="flex items-center justify-center gap-2 py-4">
			<button
				className="px-3 py-1 text-xs font-semibold rounded-md border border-[#1F2937] text-slate-300 hover:bg-[#0F172A] disabled:opacity-40"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage <= 1}
			>
				Prev
			</button>
			{pages.map((page) => (
				<button
					key={page}
					className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
						page === currentPage
							? 'border-blue-500 text-white bg-blue-600'
							: 'border-[#1F2937] text-slate-300 hover:bg-[#0F172A]'
					}`}
					onClick={() => onPageChange(page)}
				>
					{page}
				</button>
			))}
			<button
				className="px-3 py-1 text-xs font-semibold rounded-md border border-[#1F2937] text-slate-300 hover:bg-[#0F172A] disabled:opacity-40"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage >= totalPages}
			>
				Next
			</button>
		</div>
	)
}

export default Pagination
