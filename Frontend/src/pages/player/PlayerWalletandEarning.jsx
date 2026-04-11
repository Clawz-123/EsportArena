import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Wallet, Plus, Minus, Trophy, ArrowUp, Eye, X, Receipt } from 'lucide-react'
import PlayerSidebar from './PlayerSidebar'
import ProfileMenu from '../../components/common/ProfileMenu'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    fetchWalletBalance,
    fetchWalletTransactions,
    initiateEsewaTopUp,
    initiateStripeTopUp,
    initiateTopUp,
    requestWithdrawal,
    stripeConnectOnboard,
    stripeWithdraw,
    clearPaymentUrl,
    clearWalletError,
} from '../../slices/walletSlice'
import axiosInstance from '../../axios/axiousinstance'
import WalletAmount from './walletcard/WalletAmount'
import ChoosePaymentMethod from './walletcard/ChoosePaymentMethod'
import WithdrawModal from './walletcard/WithdrawModal'
import Pagination from '../../components/Pagination/Pagination'
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
        withdrawLoading,
        withdrawError,
        stripeConnectLoading,
    } = useAppSelector((state) => state.wallet)
    const [showAmountModal, setShowAmountModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [selectedAmount, setSelectedAmount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [activeTab, setActiveTab] = useState('transactions') // 'transactions' | 'withdrawals'
    const [myWithdrawals, setMyWithdrawals] = useState([])
    const [wdLoading, setWdLoading] = useState(false)
    const [viewReceipt, setViewReceipt] = useState(null)

    const extractApiMessage = useCallback((payload, fallbackMessage) => {
        const base = payload?.Error_Message ?? payload?.error_message ?? payload?.message ?? payload
        if (!base) return fallbackMessage
        if (typeof base === 'string') return base
        if (Array.isArray(base) && base.length > 0) return String(base[0])
        if (typeof base === 'object') {
            const firstValue = Object.values(base)[0]
            if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0])
            if (typeof firstValue === 'string') return firstValue
        }
        return fallbackMessage
    }, [])

    const fetchMyWithdrawals = useCallback(async () => {
        setWdLoading(true)
        try {
            const res = await axiosInstance.get('/payment/withdrawals/')
            setMyWithdrawals(res.data.Result?.withdrawals || [])
        } catch { /* silently fail */ }
        finally { setWdLoading(false) }
    }, [])

    useEffect(() => {
        dispatch(fetchWalletBalance())
        dispatch(fetchWalletTransactions())
        fetchMyWithdrawals()
    }, [dispatch, fetchMyWithdrawals])

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
            toast.error(extractApiMessage(topUpError, 'Failed to initiate payment.'))
            dispatch(clearWalletError())
        }
        if (withdrawError) {
            const msg = extractApiMessage(withdrawError, 'Withdrawal request failed.')
            toast.error(msg)
            dispatch(clearWalletError())
        }
    }, [dispatch, extractApiMessage, topUpError, withdrawError])

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
                    : methodKey === 'stripe'
                        ? 'Stripe'
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

    const totalPages = Math.max(1, Math.ceil(mappedTransactions.length / itemsPerPage))
    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return mappedTransactions.slice(start, start + itemsPerPage)
    }, [currentPage, itemsPerPage, mappedTransactions])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

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
        } else if (method === 'stripe') {
            dispatch(initiateStripeTopUp({ coins: selectedAmount }))
        } else {
            toast.info('Unsupported payment method.')
        }
        setShowPaymentModal(false)
    }

    const handleWithdraw = async (data) => {
        const result = await dispatch(requestWithdrawal(data))
        if (!result.error) {
            toast.success('Withdrawal request submitted! It will be reviewed by admin.')
            setShowWithdrawModal(false)
            dispatch(fetchWalletBalance())
            dispatch(fetchWalletTransactions())
            fetchMyWithdrawals()
        }
    }

    const handleStripeConnect = async () => {
        const result = await dispatch(stripeConnectOnboard())
        if (!result.error) {
            const url = result.payload?.Result?.url || result.payload?.result?.url
            if (url) window.location.href = url
        }
    }

    const handleStripeWithdraw = async (data) => {
        const result = await dispatch(stripeWithdraw(data))
        if (!result.error) {
            toast.success('Stripe withdrawal processed!')
            setShowWithdrawModal(false)
            dispatch(fetchWalletBalance())
            dispatch(fetchWalletTransactions())
            fetchMyWithdrawals()
        }
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
                                Add funds via eSewa, Khalti, or Stripe and manage your balance
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
                                        <button className="px-4 py-2 bg-transparent border border-white/10 hover:bg-white/5 text-white text-sm font-medium rounded-lg transition-colors"
                                            onClick={() => setShowWithdrawModal(true)}
                                        >
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

                        {/* Tabs */}
                        <div className="flex gap-2 mb-0">
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                                    activeTab === 'transactions'
                                        ? 'bg-[#111827] text-white border border-[#1F2937] border-b-0'
                                        : 'text-[#6B7280] hover:text-white'
                                }`}
                            >
                                Transaction History
                            </button>
                            <button
                                onClick={() => setActiveTab('withdrawals')}
                                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                    activeTab === 'withdrawals'
                                        ? 'bg-[#111827] text-white border border-[#1F2937] border-b-0'
                                        : 'text-[#6B7280] hover:text-white'
                                }`}
                            >
                                <Receipt className="w-4 h-4" /> My Withdrawals
                            </button>
                        </div>

                        {activeTab === 'transactions' && (
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
                                        {paginatedTransactions.map((transaction) => (
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
                                                                : transaction.methodKey === 'stripe'
                                                                    ? 'bg-indigo-500/10 text-indigo-300'
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
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                        )}

                        {activeTab === 'withdrawals' && (
                        <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#1F2937]">
                                <h2 className="text-base font-semibold text-white">My Withdrawal Requests</h2>
                            </div>
                            {wdLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : myWithdrawals.length === 0 ? (
                                <div className="text-center py-12 text-[#6B7280] text-sm">No withdrawal requests yet</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#1F2937]">
                                                <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Provider</th>
                                                <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Account</th>
                                                <th className="px-6 py-3 text-right text-[13px] font-medium text-[#9CA3AF]">Coins</th>
                                                <th className="px-6 py-3 text-right text-[13px] font-medium text-[#9CA3AF]">Fee</th>
                                                <th className="px-6 py-3 text-right text-[13px] font-medium text-[#9CA3AF]">Payout</th>
                                                <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Status</th>
                                                <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Receipt</th>
                                                <th className="px-6 py-3 text-left text-[13px] font-medium text-[#9CA3AF]">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1F2937]">
                                            {myWithdrawals.map((wd) => (
                                                <tr key={wd.id} className="hover:bg-[#0F172A] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                            wd.provider === 'esewa' ? 'bg-emerald-500/10 text-emerald-300'
                                                            : wd.provider === 'khalti' ? 'bg-purple-500/10 text-purple-300'
                                                            : 'bg-indigo-500/10 text-indigo-300'
                                                        }`}>
                                                            {wd.provider === 'esewa' ? 'eSewa' : wd.provider === 'khalti' ? 'Khalti' : 'Stripe'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#E5E7EB]">{wd.account_identifier || '—'}</td>
                                                    <td className="px-6 py-4 text-sm text-[#E5E7EB] text-right font-medium">{Number(wd.coins).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-amber-400 text-right">₨ {Number(wd.platform_fee || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-emerald-400 text-right font-medium">₨ {Number(wd.amount).toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                                                            wd.status === 'completed' ? 'border-[#10B981]/40 text-[#10B981]'
                                                            : wd.status === 'pending' ? 'border-[#F59E0B]/40 text-[#F59E0B]'
                                                            : 'border-rose-500/40 text-rose-400'
                                                        }`}>
                                                            {wd.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {wd.receipt_image ? (
                                                            <button
                                                                onClick={() => setViewReceipt(wd.receipt_image)}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                                                            >
                                                                <Eye className="w-3 h-3" /> View
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-[#4B5563]">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-[#6B7280]">
                                                        {new Date(wd.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Receipt Image Viewer */}
            {viewReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewReceipt(null)}>
                    <div className="relative max-w-2xl max-h-[80vh] p-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setViewReceipt(null)}
                            className="absolute -top-3 -right-3 z-10 p-1.5 bg-[#0F1724] border border-[#1F2937] rounded-full text-[#9CA3AF] hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <img
                            src={viewReceipt}
                            alt="Payment receipt"
                            className="max-w-full max-h-[78vh] rounded-xl border border-[#1F2937] object-contain"
                        />
                    </div>
                </div>
            )}

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

            {showWithdrawModal && (
                <WithdrawModal
                    balance={balance?.balance}
                    onClose={() => setShowWithdrawModal(false)}
                    onSubmit={handleWithdraw}
                    onStripeConnect={handleStripeConnect}
                    onStripeWithdraw={handleStripeWithdraw}
                    loading={withdrawLoading}
                    connectLoading={stripeConnectLoading}
                    stripeConnected={!!balance?.stripe_connected}
                />
            )}
        </div>
    )
}

export default PlayerWalletandEarning
