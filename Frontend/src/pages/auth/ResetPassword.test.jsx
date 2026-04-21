import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import ResetPassword from './ResetPassword'
import { toast } from 'react-toastify'
import { resetPassword } from '../../slices/auth'

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
  resetPassword: vi.fn((payload) => ({
    type: 'auth/resetPassword/pending',
    meta: { arg: payload },
  })),
  clearOtpState: vi.fn(() => ({ type: 'auth/clearOtpState' })),
}))

beforeEach(() => {
  vi.clearAllMocks()

  localStorage.setItem(
    'forgotPasswordEmail',
    JSON.stringify({ email: 'player@example.com' })
  )

  authState = {
    resetLoading: false,
    resetError: null,
    resetSuccess: false,
  }

  useDispatch.mockReturnValue(mockDispatch)
  useSelector.mockImplementation((selector) => selector({ auth: authState }))
  mockDispatch.mockImplementation((action) => action)
})

// Test to verify that password reset works with valid data and redirects to login
it('TC011 resets password with valid data and redirects to login', async () => {
  const user = userEvent.setup()

  const { rerender } = render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  )

  await user.type(screen.getByPlaceholderText(/enter new password/i), 'secret123')
  await user.type(screen.getByPlaceholderText(/confirm new password/i), 'secret123')
  await user.click(screen.getByRole('button', { name: /reset password/i }))

  expect(resetPassword).toHaveBeenCalledWith({
    email: 'player@example.com',
    new_password: 'secret123',
    confirm_password: 'secret123',
  })

  authState = { ...authState, resetSuccess: true }
  rerender(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  )

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith('Password reset successful! Redirecting to login')
  })

  await waitFor(
    () => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    },
    { timeout: 2500 }
  )

  expect(localStorage.getItem('forgotPasswordEmail')).toBeNull()
})
