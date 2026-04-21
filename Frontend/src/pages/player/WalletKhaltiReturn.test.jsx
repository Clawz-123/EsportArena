import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import WalletKhaltiReturn from './WalletKhaltiReturn'
import { useAppDispatch } from '../../store/hooks'
import { fetchWalletBalance, fetchWalletTransactions, verifyTopUp } from '../../slices/walletSlice'

const mockDispatch = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../store/hooks', () => ({
  useAppDispatch: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('pidx=test-pidx-123&status=Completed')],
  }
})

vi.mock('../../slices/walletSlice', () => ({
  verifyTopUp: vi.fn((payload) => ({
    type: 'wallet/verifyTopUp/pending',
    meta: { arg: payload },
  })),
  fetchWalletBalance: vi.fn(() => ({ type: 'wallet/fetchBalance/pending' })),
  fetchWalletTransactions: vi.fn(() => ({ type: 'wallet/fetchTransactions/pending' })),
}))

beforeEach(() => {
  vi.clearAllMocks()

  useAppDispatch.mockReturnValue(mockDispatch)
  mockDispatch.mockImplementation((action) => {
    if (action?.type === 'wallet/verifyTopUp/pending') {
      return {
        unwrap: () => Promise.resolve({ Result: { wallet: { balance: 1200 } } }),
      }
    }

    return {
      unwrap: () => Promise.resolve({}),
    }
  })
})

// Test to verify that a valid top-up with mocked successful payment triggers wallet balance refresh and navigation to wallet page
it('TC045 valid top-up with mocked successful payment refreshes wallet balance flow', async () => {
  render(
    <MemoryRouter>
      <WalletKhaltiReturn />
    </MemoryRouter>
  )

  await waitFor(() => {
    expect(verifyTopUp).toHaveBeenCalledWith({ pidx: 'test-pidx-123' })
  })

  await waitFor(() => {
    expect(fetchWalletBalance).toHaveBeenCalled()
    expect(fetchWalletTransactions).toHaveBeenCalled()
  })

  expect(screen.getByText(/payment verified\. updating wallet/i)).toBeInTheDocument()

  await waitFor(
    () => {
      expect(mockNavigate).toHaveBeenCalledWith('/PlayerWalletandEarning')
    },
    { timeout: 2500 }
  )
})
