import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { verifyTopUp, fetchWalletBalance, fetchWalletTransactions } from '../../slices/walletSlice'

const WalletKhaltiReturn = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [message, setMessage] = useState('Verifying payment...')

  useEffect(() => {
    const pidx = searchParams.get('pidx')
    const status = searchParams.get('status')

    if (!pidx) {
      setMessage('Missing payment reference. Please try again.')
      return
    }

    if (status && status !== 'Completed') {
      setMessage('Payment not completed. Please try again.')
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
  }, [dispatch, navigate, searchParams])

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
