import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Register from './Register'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
const mockDispatch = vi.fn()

vi.mock('../../store/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../slices/auth', () => {
  return {
    registerUser: vi.fn(),
    clearError: vi.fn(() => ({ type: 'auth/clearError' })),
  }
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()

  useAppDispatch.mockReturnValue(mockDispatch)
  useAppSelector.mockImplementation((selector) =>
    selector({ auth: { registerLoading: false, registerError: null } })
  )
})

// Test to check if the registration form renders correctly
it('renders register form fields and submit button', () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )

  expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/your\.email@example\.com/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/\+977 98xxxxxxxx/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
})
