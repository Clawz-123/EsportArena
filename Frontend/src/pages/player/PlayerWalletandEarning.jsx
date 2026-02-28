import React, { useEffect, useMemo, useState } from 'react'
import { Wallet, Plus, Minus, Trophy, ArrowUp } from 'lucide-react'
import PlayerSidebar from './PlayerSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    fetchWalletBalance,
    fetchWalletTransactions,
    initiateEsewaTopUp,
    initiateTopUp,
    clearPaymentUrl,
    clearWalletError,
} from '../../slices/walletSlice'
import WalletAmount from './walletcard/WalletAmount'
import ChoosePaymentMethod from './walletcard/ChoosePaymentMethod'
import { toast } from 'react-toastify'

const PlayerWalletandEarning = () => {
    const dispatch = useAppDispatch()
    const {
        balance,
        transactions,
        error,
        topUpError,
        lastPaymentUrl,
        lastEsewaPayload,
    } = useAppSelector((state) => state.wallet)
    const [showAmountModal, setShowAmountModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedAmount, setSelectedAmount] = useState(0)

    useEffect(() => {
        dispatch(fetchWalletBalance())
        dispatch(fetchWalletTransactions())
    }, [dispatch])

    useEffect(() => {
        if (lastPaymentUrl) {
            window.location.href = lastPaymentUrl
            dispatch(clearPaymentUrl())
        }
    }, [dispatch, lastPaymentUrl])

    useEffect(() => {
        if (!lastEsewaPayload?.payment_url || !lastEsewaPayload?.fields) {
            return
        }

        const form = document.createElement('form')
        form.method = 'POST'
        form.action = lastEsewaPayload.payment_url

        Object.entries(lastEsewaPayload.fields).forEach(([key, value]) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = value
            form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
        dispatch(clearPaymentUrl())
    }, [dispatch, lastEsewaPayload])

    useEffect(() => {
        if (error) {
            toast.error('Failed to load wallet data.')
            dispatch(clearWalletError())
        }
    }, [dispatch, error])

    useEffect(() => {
        if (topUpError) {
            toast.error('Failed to initiate payment.')
            dispatch(clearWalletError())
        }
    }, [dispatch, topUpError])

    const mappedTransactions = useMemo(() => {
        return (transactions || []).map((tx) => {
            const amountValue = Number(tx.amount || 0)
            const isCredit = tx.direction === 'credit'
            const title = tx.note || tx.transaction_type || 'Transaction'
            const dateLabel = tx.created_at
                ? new Date(tx.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                })
                : ''

            let icon = Minus
            let iconColor = 'bg-red-500/30'
            if (tx.transaction_type === 'deposit' || tx.transaction_type === 'prize' || isCredit) {
                icon = tx.transaction_type === 'prize' ? Trophy : Plus
                iconColor = 'bg-green-500/30'
            }
            if (tx.transaction_type === 'withdrawal') {
                icon = ArrowUp
                iconColor = 'bg-red-500/30'
            }

            let statusLabel = tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Pending'
            let statusTone = statusLabel === 'Completed' ? 'success' : 'warning'

            if (tx.transaction_type === 'prize_lock') {
                statusLabel = 'Hold'
                statusTone = 'info'
            }

            const methodRaw = typeof tx.method === 'string' ? tx.method.trim() : ''
            const methodKey = methodRaw ? methodRaw.toLowerCase() : null
            const methodLabel = methodKey === 'esewa'
                ? 'eSewa'
                : methodKey === 'khalti'
                    ? 'Khalti'
                    : methodRaw || null

            return {
                id: tx.id,
                title,
                date: dateLabel,
                amount: isCredit ? amountValue : -Math.abs(amountValue),
                method: methodLabel,
                methodKey,
                status: statusLabel,
                statusTone,
                icon,
                iconColor,
            }
        })
    }, [transactions])

    const totals = useMemo(() => {
        let deposits = 0
        let withdrawals = 0
        mappedTransactions.forEach((tx) => {
            if (tx.amount > 0) deposits += tx.amount
            if (tx.amount < 0) withdrawals += Math.abs(tx.amount)
        })
        return { deposits, withdrawals }
    }, [mappedTransactions])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US').format(Math.abs(amount))
    }

    const handleAddFunds = () => {
        setShowAmountModal(true)
    }

    const handleAmountContinue = (amount) => {
        setSelectedAmount(amount)
        setShowAmountModal(false)
        setShowPaymentModal(true)
    }

    const handlePayment = (method) => {
        if (method === 'khalti') {
            dispatch(initiateTopUp({ amount: selectedAmount }))
        } else if (method === 'esewa') {
            dispatch(initiateEsewaTopUp({ amount: selectedAmount }))
        } else {
            toast.info('Unsupported payment method.')
        }
        setShowPaymentModal(false)
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
                                        <span className="text-2xl font-bold text-white">
                                            {balance?.balance ? formatCurrency(balance.balance) : '0'}
                                        </span>
                                        <span className="text-xs text-slate-500">Coins</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                                            onClick={handleAddFunds}
                                        >
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
                                    <span className="text-2xl font-bold text-white">{formatCurrency(totals.deposits)}</span>
                                    <span className="text-xs text-slate-500">Coins</span>
                                </div>
                            </div>

                            {/* Total Withdrawals */}
                            <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700/50">
                                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Withdrawals</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{formatCurrency(totals.withdrawals)}</span>
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
                                        {mappedTransactions.map((transaction) => (
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
                  ${transaction.methodKey === 'esewa'
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
                    ${transaction.statusTone === 'success'
                                                            ? 'border-[#10B981]/40 text-[#10B981]'
                                                            : transaction.statusTone === 'info'
                                                                ? 'border-blue-500/40 text-blue-400'
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

            {showAmountModal && (
                <WalletAmount
                    onClose={() => setShowAmountModal(false)}
                    onContinue={handleAmountContinue}
                />
            )}

            {showPaymentModal && (
                <ChoosePaymentMethod
                    amount={selectedAmount}
                    onBack={() => setShowPaymentModal(false)}
                    onPay={handlePayment}
                />
            )}
        </div>
    )
}

export default PlayerWalletandEarning
