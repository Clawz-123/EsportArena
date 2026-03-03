import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { fetchWalletBalance, fetchWalletTransactions } from '../../slices/walletSlice'

const WalletStripeReturn = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const sessionId = searchParams.get('session_id')

  const [message, setMessage] = useState(() => {
    if (!sessionId) {
      return 'Missing payment reference. Please try again.'
    }
    return 'Payment received. Updating wallet...'
  })

  useEffect(() => {
    if (!sessionId) {
      return
    }

    const refresh = async () => {
      try {
        await dispatch(fetchWalletBalance()).unwrap()
        await dispatch(fetchWalletTransactions()).unwrap()
        setTimeout(() => navigate('/PlayerWalletandEarning'), 1500)
      } catch {
        setMessage('Payment is being processed. Please check your wallet in a moment.')
      }
    }

    const timer = setTimeout(refresh, 800)
    return () => clearTimeout(timer)
  }, [dispatch, navigate, sessionId])

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-white mb-2">Payment Status</h1>
        <p className="text-sm text-slate-400">{message}</p>
        <button
          onClick={() => navigate('/PlayerWalletandEarning')}
          className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg"
        >
          Back to Wallet
        </button>
      </div>
    </div>
  )
}

export default WalletStripeReturn
