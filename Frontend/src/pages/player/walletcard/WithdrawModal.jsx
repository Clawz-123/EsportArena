import React, { useState } from 'react'
import { X, ArrowRight, ArrowLeft, AlertCircle, Zap, ExternalLink } from 'lucide-react'

const METHODS = [
  {
    id: 'esewa',
    name: 'eSewa',
    description: 'Withdraw to eSewa wallet',
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-500/10 hover:border-emerald-500/50',
    activeColor: 'bg-emerald-500/10 border-emerald-500',
    iconText: 'e',
    placeholder: 'eSewa ID (phone number)',
    needsAccount: true,
    currency: '₨',
    note: 'Reviewed by admin. May take 1-2 business days.',
  },
  {
    id: 'khalti',
    name: 'Khalti',
    description: 'Withdraw to Khalti wallet',
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-600/10 hover:border-purple-600/50',
    activeColor: 'bg-purple-600/10 border-purple-600',
    iconText: 'K',
    placeholder: 'Khalti phone number',
    needsAccount: true,
    currency: '₨',
    note: 'Reviewed by admin. May take 1-2 business days.',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Instant payout to your bank account',
    color: 'bg-indigo-600',
    hoverColor: 'hover:bg-indigo-600/10 hover:border-indigo-600/50',
    activeColor: 'bg-indigo-600/10 border-indigo-600',
    iconText: 'S',
    needsAccount: false,
    currency: '$',
    note: 'Processed instantly via Stripe.',
  },
]

const COIN_RATE = 130 // 130 coins = $1

const WithdrawModal = ({ balance, onClose, onSubmit, onStripeConnect, onStripeWithdraw, loading, connectLoading, stripeConnected }) => {
  const [step, setStep] = useState(1) // 1: amount, 2: method, 3: confirm
  const [coins, setCoins] = useState('')
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [accountId, setAccountId] = useState('')
  const [error, setError] = useState('')

  const coinNum = Number(coins) || 0
  const walletBalance = Number(balance) || 0
  const FEE_PERCENT = 5
  const feeCoins = Math.round(coinNum * FEE_PERCENT / 100)
  const netCoins = coinNum - feeCoins

  const isStripe = selectedMethod?.id === 'stripe'
  const displayCurrency = selectedMethod?.currency || '₨'
  const displayAmount = isStripe
    ? (netCoins / COIN_RATE).toFixed(2)
    : netCoins.toLocaleString()

  const handleAmountNext = () => {
    if (coinNum < 10) return setError('Minimum withdrawal is 10 coins')
    if (coinNum > walletBalance) return setError('Insufficient balance')
    setError('')
    setStep(2)
  }

  const handleMethodNext = () => {
    if (!selectedMethod) return
    if (selectedMethod.id === 'stripe' && !stripeConnected) return
    setError('')
    if (selectedMethod.needsAccount) {
      setStep(3) // go to account details
    } else {
      setStep(4) // skip to final confirm
    }
  }

  const handleAccountNext = () => {
    const id = accountId.trim()
    if (!id) return setError('Please enter your account details')
    setError('')
    setStep(4) // go to final confirm
  }

  const handleConfirm = () => {
    if (isStripe) {
      onStripeWithdraw({ coins: coinNum })
    } else {
      const id = accountId.trim()
      onSubmit({ coins: coinNum, provider: selectedMethod.id, account_identifier: id })
    }
  }

  const quickAmounts = [100, 500, 1000, 5000]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#0F172A] border border-slate-700 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2 border-b border-slate-700/50">
          <div>
            <h2 className="text-lg font-semibold text-white">Withdraw Funds</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1 && 'Enter amount to withdraw'}
              {step === 2 && 'Choose withdrawal method'}
              {step === 3 && 'Enter account details'}
              {step === 4 && 'Confirm your withdrawal'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Step 1: Amount */}
          {step === 1 && (
            <>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-white">{walletBalance.toLocaleString()} <span className="text-sm text-slate-500">Coins</span></p>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Amount (Coins)</label>
                <input
                  type="number"
                  value={coins}
                  onChange={(e) => { setCoins(e.target.value); setError('') }}
                  placeholder="Enter coins to withdraw"
                  min={10}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E293B] border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-2">
                {quickAmounts.filter(a => a <= walletBalance).map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setCoins(String(amt)); setError('') }}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      coinNum === amt
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                        : 'bg-[#1E293B] border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {coinNum > 0 && (
                <div className="bg-[#1E293B] rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Withdrawal amount</span>
                    <span>{coinNum.toLocaleString()} coins</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-amber-400">
                    <span>Platform fee ({FEE_PERCENT}%)</span>
                    <span>- {feeCoins.toLocaleString()} coins</span>
                  </div>
                  <div className="border-t border-slate-700 pt-1.5 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Net after fee</span>
                    <span className="text-lg font-semibold text-white">{netCoins.toLocaleString()} <span className="text-xs text-slate-500">coins</span></span>
                  </div>
                </div>
              )}

              {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}

              <button
                onClick={handleAmountNext}
                disabled={coinNum < 10}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Step 2: Method */}
          {step === 2 && (
            <>
              <div className="space-y-3">
                {METHODS.map((m) => {
                  const isStripeMethod = m.id === 'stripe'
                  const notConnected = isStripeMethod && !stripeConnected
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        selectedMethod?.id === m.id
                          ? m.activeColor
                          : `border-slate-700 ${m.hoverColor}`
                      }`}
                    >
                      <div className={`w-10 h-10 ${m.color} rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                        {m.iconText}
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{m.name}</p>
                          {isStripeMethod && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-xs text-slate-500">{m.description}</p>
                      </div>
                      {isStripeMethod && !stripeConnected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium whitespace-nowrap">
                          Not connected
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Stripe connect prompt */}
              {selectedMethod?.id === 'stripe' && !stripeConnected && (
                <button
                  onClick={onStripeConnect}
                  disabled={connectLoading}
                  className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {connectLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Connect Stripe Account <ExternalLink className="w-4 h-4" /></>
                  )}
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-lg bg-[#1E293B] text-slate-300 text-sm font-medium hover:bg-[#374151] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleMethodNext}
                  disabled={!selectedMethod || (selectedMethod?.id === 'stripe' && !stripeConnected)}
                  className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Step 3: Account details (eSewa/Khalti only) */}
          {step === 3 && selectedMethod && (
            <>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">{selectedMethod.placeholder}</label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => { setAccountId(e.target.value); setError('') }}
                  placeholder={selectedMethod.placeholder}
                  className="w-full px-4 py-3 rounded-lg bg-[#1E293B] border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(2); setError('') }}
                  className="flex-1 py-3 rounded-lg bg-[#1E293B] text-slate-300 text-sm font-medium hover:bg-[#374151] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleAccountNext}
                  disabled={!accountId.trim()}
                  className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Step 4: Final confirmation */}
          {step === 4 && selectedMethod && (
            <>
              <div className="bg-[#1E293B] rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Coins</span>
                  <span className="text-white font-medium">{coinNum.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Platform fee ({FEE_PERCENT}%)</span>
                  <span className="text-amber-400 font-medium">- {feeCoins.toLocaleString()} coins</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">You receive</span>
                  <span className="text-emerald-400 font-semibold">{displayCurrency} {displayAmount}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Method</span>
                  <span className="text-white font-medium">{selectedMethod.name}</span>
                </div>
              </div>

              <div className={`${isStripe ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-amber-500/10 border-amber-500/20'} border rounded-lg p-3`}>
                <p className={`text-xs ${isStripe ? 'text-indigo-300' : 'text-amber-400'} flex items-start gap-2`}>
                  {isStripe ? <Zap className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {selectedMethod.note}
                </p>
              </div>

              {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(selectedMethod.needsAccount ? 3 : 2); setError('') }}
                  className="flex-1 py-3 rounded-lg bg-[#1E293B] text-slate-300 text-sm font-medium hover:bg-[#374151] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Confirm Withdrawal'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default WithdrawModal
