import React from 'react'
import {
    Wallet,
    Plus,
    Minus,
    Trophy,
    ArrowUp
} from 'lucide-react'
import PlayerSidebar from './PlayerSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'

const PlayerWalletandEarning = () => {
    // Mock data for transactions
    const transactions = [
        {
            id: 1,
            type: 'withdrawal',
            title: 'Withdrawal Request',
            date: 'Jan 15, 2026 - 10:17 AM',
            amount: -1000,
            method: 'eSewa',
            status: 'Pending',
            icon: ArrowUp,
            iconColor: 'bg-red-500/30',
        },
        {
            id: 2,
            type: 'deposit',
            title: 'Wallet Top-up',
            date: 'Jan 15, 2026 - 10:16 AM',
            amount: +100,
            method: 'Khalti',
            status: 'Completed',
            icon: Plus,
            iconColor: 'bg-green-500/30',
        },
        {
            id: 3,
            type: 'deposit',
            title: 'Wallet Top-up via eSewa',
            date: 'Jan 15, 2026 - 2:29 PM',
            amount: +500,
            method: 'eSewa',
            status: 'Completed',
            icon: Plus,
            iconColor: 'bg-green-500/30',
        },
        {
            id: 4,
            type: 'fee',
            title: 'Entry Fee: PUBG Mobile Championship',
            date: 'Jan 14, 2026 - 10:15 AM',
            amount: -100,
            method: null,
            status: 'Completed',
            icon: Minus,
            iconColor: 'bg-red-500/30',
        },
        {
            id: 5,
            type: 'prize',
            title: 'Prize: Free Fire League - 2nd Place',
            date: 'Jan 12, 2026 - 6:00 PM',
            amount: +750,
            method: null,
            status: 'Completed',
            icon: Trophy,
            iconColor: 'bg-green-500/30',
        },
        {
            id: 6,
            type: 'fee',
            title: 'Entry Fee: Free Fire League',
            date: 'Jan 10, 2026 - 11:10 AM',
            amount: -50,
            method: null,
            status: 'Completed',
            icon: Minus,
            iconColor: 'bg-red-500/30',
        },
        {
            id: 7,
            type: 'deposit',
            title: 'Wallet Top-up via Khalti',
            date: 'Jan 8, 2026 - 3:45 PM',
            amount: +1000,
            method: 'Khalti',
            status: 'Completed',
            icon: Plus,
            iconColor: 'bg-green-500/30',
        },
        {
            id: 8,
            type: 'withdrawal',
            title: 'Withdrawal to eSewa',
            date: 'Jan 5, 2026 - 9:20 AM',
            amount: -500,
            method: 'eSewa',
            status: 'Completed',
            icon: ArrowUp,
            iconColor: 'bg-red-500/30',
        },
        {
            id: 9,
            type: 'prize',
            title: 'Prize: PUBG Mobile Weekly - 1st Place',
            date: 'Jan 3, 2026 - 8:45 PM',
            amount: +500,
            method: null,
            status: 'Completed',
            icon: Trophy,
            iconColor: 'bg-green-500/30',
        },
    ]

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US').format(Math.abs(amount))
    }

    return (
        <div className="flex min-h-screen bg-[#0F172A]">
            {/* Sidebar */}
            <PlayerSidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-[#0F172A] border-b border-[#1F2937] px-8 py-6">
                    <div className="flex justify-end mb-6">
                        <ProfileMenu />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Wallet className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Wallet & Transactions</h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Add funds via eSewa or Khalti and manage your balance
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-6 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Current Balance */}
                            <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700/50">
                                <div className="relative z-10">
                                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Current Balance</div>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-2xl font-bold text-white">350</span>
                                        <span className="text-xs text-slate-500">Coins</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                                            Add Funds
                                        </button>
                                        <button className="px-4 py-2 bg-transparent border border-white/10 hover:bg-white/5 text-white text-sm font-medium rounded-lg transition-colors">
                                            Withdraw
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Total Deposits */}
                            <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700/50">
                                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Deposits</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">1,600</span>
                                    <span className="text-xs text-slate-500">Coins</span>
                                </div>
                            </div>

                            {/* Total Withdrawals */}
                            <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700/50">
                                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Withdrawals</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">500</span>
                                    <span className="text-xs text-slate-500">Coins</span>
                                </div>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#1F2937]">
                                <h2 className="text-base font-semibold text-white">Transaction History</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#1F2937]">
                                            <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Activity</th>
                                            <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF] hidden md:table-cell">Method</th>
                                            <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF] hidden md:table-cell">Status</th>
                                            <th className="px-6 py-3 text-right text-[13px] font-medium text-[#9CA3AF]">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1F2937]">
                                        {transactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-[#0F172A] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-9 h-9 rounded-full ${transaction.iconColor} flex items-center justify-center shrink-0`}>
                                                            <transaction.icon className="w-4 h-4 text-white/80" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-white truncate">{transaction.title}</p>
                                                            <p className="text-xs text-slate-500">{transaction.date}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    {transaction.method ? (
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${transaction.method === 'eSewa'
                                                                ? 'bg-emerald-500/10 text-emerald-300'
                                                                : 'bg-purple-500/10 text-purple-300'
                                                            }`}>
                                                            {transaction.method}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-600">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${transaction.status === 'Completed'
                                                            ? 'border-[#10B981]/40 text-[#10B981]'
                                                            : 'border-[#F59E0B]/40 text-[#F59E0B]'
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className={`text-sm font-semibold ${transaction.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">Coins</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerWalletandEarning
