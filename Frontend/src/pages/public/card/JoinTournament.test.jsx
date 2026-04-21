import { useCallback, useState } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import JoinTournament from './JoinTournament'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { joinTournament } from '../../../slices/tournamentSlice'

const mockDispatch = vi.fn()
const mockOnClose = vi.fn()
let appState

vi.mock('../../../store/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('../../../slices/tournamentSlice', () => ({
  joinTournament: vi.fn((payload) => ({
    type: 'tournament/join/pending',
    meta: { arg: payload },
  })),
  clearSuccess: vi.fn(() => ({ type: 'tournament/clearSuccess' })),
  clearError: vi.fn(() => ({ type: 'tournament/clearError' })),
  fetchUsers: vi.fn(() => ({ type: 'tournament/fetchUsers/pending' })),
  fetchTournamentParticipants: vi.fn((id) => ({
    type: 'tournament/fetchParticipants/pending',
    meta: { arg: id },
  })),
}))

vi.mock('../../../slices/walletSlice', () => ({
  fetchWalletBalance: vi.fn(() => ({ type: 'wallet/fetchBalance/pending' })),
}))

function JoinTournamentHarness({ tournament }) {
  const [participantCount, setParticipantCount] = useState(1)

  const handleJoin = useCallback(() => {
    setParticipantCount((prev) => prev + 1)
  }, [])

  return (
    <>
      <p>Participant Count: {participantCount}</p>
      <JoinTournament
        tournament={tournament}
        isOpen
        onClose={mockOnClose}
        onJoin={handleJoin}
      />
    </>
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  appState = {
    auth: {
      user: {
        id: 1,
        name: 'Captain',
        is_organizer: false,
      },
    },
    profile: {
      profile: {
        username: 'Captain',
      },
    },
    tournament: {
      joinLoading: false,
      joinSuccess: false,
      joinError: null,
      users: [],
      usersLoading: false,
      usersError: null,
      participants: [],
      participantsLoading: false,
      participantsError: null,
    },
    wallet: {
      balance: {
        balance: 500,
      },
    },
  }

  useAppDispatch.mockReturnValue(mockDispatch)
  useAppSelector.mockImplementation((selector) => selector(appState))
  mockDispatch.mockImplementation(async (action) => action)
})

// Test to check if an eligible player can join an open tournament and participant count updates
it('TC029 eligible player joins open tournament and participant count updates', async () => {
  const user = userEvent.setup()

  const tournament = {
    id: 101,
    name: 'Open Solo Cup',
    match_format: 'Solo',
    entry_fee: 100,
  }

  const { rerender } = render(
    <MemoryRouter>
      <JoinTournamentHarness tournament={tournament} />
    </MemoryRouter>
  )

  expect(screen.getByText(/participant count: 1/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /continue/i }))

  await user.type(screen.getByPlaceholderText(/enter your in-game name/i), 'captain_ign')
  await user.click(screen.getByRole('button', { name: /join tournament/i }))

  await waitFor(() => {
    expect(joinTournament).toHaveBeenCalledWith(
      expect.objectContaining({
        tournamentId: 101,
        teamName: '',
        teamMembers: [],
        inGameNames: expect.objectContaining({
          '1': 'captain_ign',
        }),
      })
    )
  })

  appState = {
    ...appState,
    tournament: {
      ...appState.tournament,
      joinSuccess: true,
    },
  }

  rerender(
    <MemoryRouter>
      <JoinTournamentHarness tournament={tournament} />
    </MemoryRouter>
  )

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith('Successfully joined tournament!')
  })

  await waitFor(() => {
    expect(screen.getByText(/participant count: 2/i)).toBeInTheDocument()
    expect(mockOnClose).toHaveBeenCalled()
  })
})
