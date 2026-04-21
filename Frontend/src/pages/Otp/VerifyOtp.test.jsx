import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import VerifyOtp from './VerifyOtp'
import { toast } from 'react-toastify'
import { verifyOtp } from '../../slices/auth'

const mockNavigate = vi.fn()
const mockDispatch = vi.fn()
let authState

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../slices/auth', () => ({
  verifyOtp: vi.fn((payload) => ({
    type: 'auth/verifyOtp/pending',
    meta: { arg: payload },
  })),
  resendOtp: vi.fn(),
  sendResetOtp: vi.fn(),
  clearOtpState: vi.fn(() => ({ type: 'auth/clearOtpState' })),
}))

beforeEach(() => {
  vi.clearAllMocks()

  localStorage.setItem(
    'registeredData',
    JSON.stringify({
      email: 'player@example.com',
      name: 'Test Player',
      userType: 'player',
    })
  )

  authState = {
    otpLoading: false,
    otpError: null,
    otpSuccess: false,
    resendLoading: false,
    resendSuccess: false,
    resendError: null,
  }

  useDispatch.mockReturnValue(mockDispatch)
  useSelector.mockImplementation((selector) => selector({ auth: authState }))
  mockDispatch.mockImplementation((action) => action)
})

afterEach(() => {
  localStorage.clear()
})

// Test to verify that a valid OTP is processed successfully before expiry
it('TC003 verifies valid OTP before expiry successfully', async () => {
  const user = userEvent.setup()

  const { rerender } = render(
    <MemoryRouter>
      <VerifyOtp />
    </MemoryRouter>
  )

  await user.type(screen.getByPlaceholderText(/enter 6-digit otp/i), '123456')
  await user.click(screen.getByRole('button', { name: /verify otp/i }))

  expect(verifyOtp).toHaveBeenCalledWith({
    email: 'player@example.com',
    otp: '123456',
  })

  authState = { ...authState, otpSuccess: true }
  rerender(
    <MemoryRouter>
      <VerifyOtp />
    </MemoryRouter>
  )

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith('OTP verified successfully!')
  })

  await waitFor(
    () => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    },
    { timeout: 2000 }
  )
})
