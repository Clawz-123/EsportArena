import React from 'react'
import { toast } from 'react-toastify'
import { Download } from 'lucide-react'

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const buildReportHtml = ({ reportTitle, stats, columns, rows }) => {
  const statsHtml = (stats || [])
    .map(
      (item) => `
        <div class="card">
          <div class="label">${escapeHtml(item.label)}</div>
          <div class="value">${escapeHtml(item.value)}</div>
        </div>
      `
    )
    .join('')

  const headerHtml = (columns || [])
    .map((col) => `<th>${escapeHtml(col)}</th>`)
    .join('')

  const rowsHtml = (rows || [])
    .map(
      (row) => `
        <tr>
          ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
        </tr>
      `
    )
    .join('')

  return `
    <html>
    <head>
      <title>${escapeHtml(reportTitle)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
        h1 { margin: 0 0 6px 0; }
        .meta { color: #555; margin-bottom: 16px; }
        .stats { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; min-width: 120px; }
        .label { font-size: 11px; color: #666; text-transform: uppercase; }
        .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(reportTitle)}</h1>
      <div class="meta">Generated on ${escapeHtml(new Date().toLocaleString())}</div>
      <div class="stats">${statsHtml}</div>
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowsHtml || `<tr><td colspan="${columns.length || 1}">No records found.</td></tr>`}</tbody>
      </table>
      <script>window.onload = function(){ window.print(); }</script>
    </body>
    </html>
  `
}

const PdfExportButton = ({
  reportTitle,
  stats,
  columns,
  rows,
  label = 'Export PDF',
  className = '',
}) => {
  const handleExport = () => {
    const html = buildReportHtml({ reportTitle, stats, columns, rows })

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Unable to open print window for PDF export.')
      return
    }

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <button
      onClick={handleExport}
      className={className || 'inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg'}
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  )
}

export default PdfExportButton
