import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { verifyTopUp, fetchWalletBalance, fetchWalletTransactions } from '../../slices/walletSlice'

const WalletKhaltiReturn = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const pidx = searchParams.get('pidx')
  const status = searchParams.get('status')
  
  const [message, setMessage] = useState(() => {
    if (!pidx) {
      return 'Missing payment reference. Please try again.'
    }
    if (status && status !== 'Completed') {
      return 'Payment not completed. Please try again.'
    }
    return 'Verifying payment...'
  })

  useEffect(() => {
    if (!pidx || (status && status !== 'Completed')) {
      return
    }

    dispatch(verifyTopUp({ pidx }))
      .unwrap()
      .then(() => {
        setMessage('Payment verified. Updating wallet...')
        dispatch(fetchWalletBalance())
        dispatch(fetchWalletTransactions())
        setTimeout(() => navigate('/PlayerWalletandEarning'), 1500)
      })
      .catch(() => {
        setMessage('Payment verification failed. Please contact support.')
      })
  }, [dispatch, navigate, pidx, status])

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

export default WalletKhaltiReturn
