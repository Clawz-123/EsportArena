import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { verifyEsewaTopUp, fetchWalletBalance, fetchWalletTransactions } from '../../slices/walletSlice'

const WalletEsewaReturn = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const dataParam = searchParams.get('data') || searchParams.get('response') || ''
  let decoded = null

  if (dataParam) {
    try {
      const normalized = dataParam.replace(/-/g, '+').replace(/_/g, '/')
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
      const jsonText = atob(padded)
      decoded = JSON.parse(jsonText)
    } catch (error) {
      decoded = null
    }
  }

  const transactionUuid = decoded?.transaction_uuid
  const totalAmount = decoded?.total_amount
  const productCode = decoded?.product_code
  const signedFieldNames = decoded?.signed_field_names
  const signature = decoded?.signature
  const status = decoded?.status
  const transactionCode = decoded?.transaction_code

  const [message, setMessage] = useState(() => {
    if (!transactionUuid || !totalAmount || !productCode || !signedFieldNames || !signature) {
      return 'Missing payment reference. Please try again.'
    }
    return 'Verifying payment...'
  })

  useEffect(() => {
    if (!transactionUuid || !totalAmount || !productCode || !signedFieldNames || !signature) {
      return
    }

    dispatch(
      verifyEsewaTopUp({
        transactionUuid,
        totalAmount,
        productCode,
        signedFieldNames,
        signature,
        status,
        transactionCode,
      })
    )
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
  }, [
    dispatch,
    navigate,
    transactionUuid,
    totalAmount,
    productCode,
    signedFieldNames,
    signature,
    status,
    transactionCode,
  ])

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

export default WalletEsewaReturn
