import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import UpdateProfile from './UpdateProfile'
import { toast } from 'react-toastify'
import { clearUpdateSuccess, fetchUserProfile, updateUserProfile } from '../../slices/viewprofile'

const mockNavigate = vi.fn()
const mockDispatch = vi.fn()
let appState

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

vi.mock('../../slices/viewprofile', () => ({
  fetchUserProfile: vi.fn(() => ({ type: 'profile/fetchUserProfile/pending' })),
  updateUserProfile: vi.fn((payload) => ({
    type: 'profile/updateUserProfile/pending',
    meta: { arg: payload },
  })),
  clearUpdateSuccess: vi.fn(() => ({ type: 'profile/clearUpdateSuccess' })),
}))

vi.mock('../../components/common/Header', () => ({
  default: () => <div>Header</div>,
}))

vi.mock('../../components/common/Footer', () => ({
  default: () => <div>Footer</div>,
}))

beforeEach(() => {
  vi.clearAllMocks()

  appState = {
    auth: {
      isAuthenticated: true,
    },
    profile: {
      profile: {
        username: 'Old Name',
        contact: '9800000000',
        email: 'old@example.com',
        role: 'Player',
        profile_image: null,
      },
      loading: false,
      updating: false,
      updateSuccess: false,
      updateError: null,
    },
  }

  useDispatch.mockReturnValue(mockDispatch)
  useSelector.mockImplementation((selector) => selector(appState))
  mockDispatch.mockImplementation((action) => action)
})

// Update profile test case to check successful update and redirection to profile page
it('TC013 updates profile with valid data and redirects to profile page', async () => {
  const user = userEvent.setup()

  const { rerender } = render(
    <MemoryRouter>
      <UpdateProfile />
    </MemoryRouter>
  )

  expect(fetchUserProfile).toHaveBeenCalled()

  const displayNameInput = screen.getByLabelText(/display name/i)
  const contactInput = screen.getByLabelText(/contact no/i)

  await user.clear(displayNameInput)
  await user.type(displayNameInput, 'Pro Gamer')
  await user.clear(contactInput)
  await user.type(contactInput, '9812345678')
  await user.click(screen.getByRole('button', { name: /save changes/i }))

  await waitFor(() => {
    expect(updateUserProfile).toHaveBeenCalledWith({
      name: 'Pro Gamer',
      phone_number: '9812345678',
    })
  })

  appState = {
    ...appState,
    profile: {
      ...appState.profile,
      updateSuccess: true,
    },
  }

  rerender(
    <MemoryRouter>
      <UpdateProfile />
    </MemoryRouter>
  )

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!')
    expect(clearUpdateSuccess).toHaveBeenCalled()
  })

  await waitFor(
    () => {
      expect(mockNavigate).toHaveBeenCalledWith('/view-profile')
    },
    { timeout: 2500 }
  )
})
