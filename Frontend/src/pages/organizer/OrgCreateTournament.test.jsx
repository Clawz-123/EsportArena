import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import OrgCreateTournament from './OrgCreateTournament'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createTournament } from '../../slices/tournamentSlice'

const mockNavigate = vi.fn()
const mockDispatch = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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

vi.mock('../../components/common/ProfileMenu', () => ({
  default: () => <div>ProfileMenu</div>,
}))

vi.mock('./OrgSidebar', () => ({
  default: () => <div>OrgSidebar</div>,
}))

vi.mock('../../slices/tournamentSlice', () => {
  const createTournamentMock = vi.fn((payload) => ({
    type: 'tournament/create/pending',
    meta: { arg: payload },
  }))

  createTournamentMock.fulfilled = {
    match: (action) => action?.type === 'tournament/create/fulfilled',
  }

  return {
    createTournament: createTournamentMock,
    updateTournament: vi.fn(),
    fetchTournamentDetail: vi.fn(),
    clearError: vi.fn(() => ({ type: 'tournament/clearError' })),
    clearSuccess: vi.fn(() => ({ type: 'tournament/clearSuccess' })),
  }
})

const formatDate = (offsetDays) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

beforeEach(() => {
  vi.clearAllMocks()

  useAppDispatch.mockReturnValue(mockDispatch)
  useAppSelector.mockImplementation((selector) =>
    selector({
      tournament: {
        createLoading: false,
        createError: null,
        updateLoading: false,
        updateError: null,
        currentTournament: null,
      },
    })
  )

  mockDispatch.mockImplementation(async (action) => {
    if (action?.type === 'tournament/create/pending') {
      return { type: 'tournament/create/fulfilled' }
    }

    return action
  })
})

// Test to check tournament creation with valid required fields and date logic
it('TC022 creates tournament with valid required fields and date', async () => {
  const user = userEvent.setup()

  render(
    <MemoryRouter>
      <OrgCreateTournament />
    </MemoryRouter>
  )

  const registrationStart = formatDate(1)
  const registrationEnd = formatDate(2)
  const matchStart = formatDate(3)
  const expectedEnd = formatDate(4)
  const description = Array.from({ length: 50 }, (_, i) => `word${i + 1}`).join(' ')

  await user.type(screen.getByPlaceholderText(/enter tournament name/i), 'Spring Championship')
  await user.selectOptions(document.querySelector('select[name="gameTitle"]'), 'PUBG Mobile')
  await user.selectOptions(document.querySelector('select[name="matchFormat"]'), 'Squad')
  await user.type(screen.getByPlaceholderText(/enter tournament description/i), description)

  await user.type(document.querySelector('input[name="registrationStart"]'), registrationStart)
  await user.type(document.querySelector('input[name="registrationEnd"]'), registrationEnd)
  await user.type(document.querySelector('input[name="matchStart"]'), matchStart)
  await user.type(document.querySelector('input[name="expectedEnd"]'), expectedEnd)

  await user.type(screen.getByPlaceholderText(/select or type team slots/i), '16')
  await user.clear(document.querySelector('input[name="entryFee"]'))
  await user.type(document.querySelector('input[name="entryFee"]'), '100')
  await user.clear(document.querySelector('input[name="prizeFirst"]'))
  await user.type(document.querySelector('input[name="prizeFirst"]'), '1000')
  await user.clear(document.querySelector('input[name="prizeSecond"]'))
  await user.type(document.querySelector('input[name="prizeSecond"]'), '500')
  await user.clear(document.querySelector('input[name="prizeThird"]'))
  await user.type(document.querySelector('input[name="prizeThird"]'), '250')

  await user.click(screen.getByRole('button', { name: /create tournament/i }))

  await waitFor(() => {
    expect(createTournament).toHaveBeenCalledWith({
      name: 'Spring Championship',
      game_title: 'PUBG Mobile',
      match_format: 'Squad',
      description,
      registration_start: registrationStart,
      registration_end: registrationEnd,
      match_start: matchStart,
      expected_end: expectedEnd,
      max_participants: 16,
      entry_fee: 100,
      prize_first: 1000,
      prize_second: 500,
      prize_third: 250,
      match_rules: '',
      auto_start_tournament: false,
    })
  })

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith('Tournament created successfully!')
    expect(mockNavigate).toHaveBeenCalledWith('/Orgtournaments')
  })
})
