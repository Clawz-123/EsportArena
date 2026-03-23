import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import Login from './Login'
import { loginUser } from '../../slices/auth'

// create mocks for useNavigate, useDispatch, useSelector, toast, and loginUser thunk
const mockNavigate = vi.fn()
const mockDispatch = vi.fn()

// Mocking react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})


// Mocking react-redux's useDispatch and useSelector
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

// Mocking the loginUser thunk
vi.mock('../../slices/auth', () => {
  const loginUserMock = vi.fn()
  loginUserMock.fulfilled = {
    match: (action) => action?.type === 'auth/login/fulfilled',
  }

  return {
    loginUser: loginUserMock,
  }
})

// Tests for the Login component
describe('Login component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    useSelector.mockImplementation((selector) => selector({ auth: { loading: false } }))
    loginUser.mockReturnValue({ type: 'auth/login/pending' })
  })

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    // helper function to get the password input field
  const getPasswordInput = () =>
    screen.getByLabelText('Password', { selector: 'input' })

  it('renders login form fields and submit button', () => {
    renderLogin()

    // Check for presence of form fields and button
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(getPasswordInput()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

//   Testing form validation errors when submitting empty form
  it('shows validation errors when submitted with empty form', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    expect(mockDispatch).not.toHaveBeenCalled()
  })

//   Testing successful login flow for an organizer user
  it('dispatches login and navigates organizer to organizer dashboard on success', async () => {
    const user = userEvent.setup()
    mockDispatch.mockResolvedValue({
      type: 'auth/login/fulfilled',
      payload: {
        user: {
          is_organizer: true,
          role: 'Player',
        },
      },
    })

    renderLogin()

    // Filling out the form and submitting
    await user.type(screen.getByLabelText(/email/i), 'org@example.com')
    await user.type(getPasswordInput(), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'org@example.com',
          password: 'password123',
        })
      )
      expect(mockNavigate).toHaveBeenCalledWith('/OrgDashboard')
      expect(toast.success).toHaveBeenCalledWith('Signed in successfully')
    })
  })

  it('shows error toast when login thunk is rejected', async () => {
    const user = userEvent.setup()
    mockDispatch.mockResolvedValue({
      type: 'auth/login/rejected',
      payload: { detail: 'Invalid credentials' },
    })

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'player@example.com')
    await user.type(getPasswordInput(), 'badpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
