import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import Leaderboard from './Leaderboard'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchTournamentBracket } from '../../../slices/BracketSlice'
import { fetchLeaderboardEntries } from '../../../slices/leaderBoardSlice'

const mockDispatch = vi.fn()
let appState

vi.mock('../../../store/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

vi.mock('../../../slices/BracketSlice', () => ({
  fetchTournamentBracket: vi.fn((tournamentId) => ({
    type: 'bracket/fetch/pending',
    meta: { arg: tournamentId },
  })),
}))

vi.mock('../../../slices/leaderBoardSlice', () => ({
  fetchLeaderboardEntries: vi.fn((payload) => ({
    type: 'leaderboard/fetchByTournament/pending',
    meta: { arg: payload },
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()

  appState = {
    bracket: {
      bracket: {
        id: 10,
        bracket_data: [{ name: 'Group A' }],
      },
    },
    leaderboard: {
      loading: false,
      error: null,
      entries: [
        {
          id: 1,
          team_name: 'Team Alpha',
          placement_points: 20,
          kill_points: 10,
          wwcd: 0,
          total_points: 30,
        },
        {
          id: 2,
          team_name: 'Team Bravo',
          placement_points: 22,
          kill_points: 18,
          wwcd: 1,
          total_points: 40,
        },
      ],
    },
  }

  useAppDispatch.mockReturnValue(mockDispatch)
  useAppSelector.mockImplementation((selector) => selector(appState))
  mockDispatch.mockImplementation((action) => action)
})

// Test to verify that leaderboard entries are fetched and displayed in correct order based on total points
it('TC038 shows updated points and corrected ranking order after result update', async () => {
  const tournament = { id: 55 }

  const { rerender } = render(<Leaderboard tournament={tournament} />)

  await waitFor(() => {
    expect(fetchTournamentBracket).toHaveBeenCalledWith(55)
    expect(fetchLeaderboardEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        tournamentId: 55,
        groupName: 'Group A',
      })
    )
  })

  let rows = screen.getAllByRole('row').slice(1)
  expect(rows[0]).toHaveTextContent('Team Bravo')
  expect(rows[0]).toHaveTextContent('40')
  expect(rows[1]).toHaveTextContent('Team Alpha')
  expect(rows[1]).toHaveTextContent('30')

  appState = {
    ...appState,
    leaderboard: {
      ...appState.leaderboard,
      entries: [
        {
          id: 1,
          team_name: 'Team Alpha',
          placement_points: 30,
          kill_points: 25,
          wwcd: 1,
          total_points: 55,
        },
        {
          id: 2,
          team_name: 'Team Bravo',
          placement_points: 22,
          kill_points: 18,
          wwcd: 1,
          total_points: 40,
        },
      ],
    },
  }

  rerender(<Leaderboard tournament={tournament} />)

  await waitFor(() => {
    const updatedRows = screen.getAllByRole('row').slice(1)
    expect(updatedRows[0]).toHaveTextContent('Team Alpha')
    expect(updatedRows[0]).toHaveTextContent('55')
    expect(updatedRows[1]).toHaveTextContent('Team Bravo')
    expect(updatedRows[1]).toHaveTextContent('40')
  })
})
