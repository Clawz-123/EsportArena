import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Login from './Login'
import { loginUser } from '../../slices/auth'

const mockNavigate = vi.fn()
const mockDispatch = vi.fn()

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

vi.mock('../../slices/auth', () => {
  const loginUserMock = vi.fn()
  loginUserMock.fulfilled = {
    match: (action) => action?.type === 'auth/login/fulfilled',
  }

  return {
    loginUser: loginUserMock,
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  useDispatch.mockReturnValue(mockDispatch)
  useSelector.mockImplementation((selector) => selector({ auth: { loading: false } }))
  loginUser.mockReturnValue({ type: 'auth/login/pending' })
})

// Test to check if the login form renders correctly
it('renders login form fields and submit button', () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

  expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  expect(screen.getByLabelText('Password', { selector: 'input' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
})