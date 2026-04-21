import { expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ChatInput from './ChatInput'
import axiosInstance from '../../axios/axiousinstance'

vi.mock('../../axios/axiousinstance', () => ({
  default: {
    post: vi.fn(),
  },
}))

// Test to verify that toxic messages are blocked and appropriate error is shown
it('TC050 blocks toxic message and shows moderation error', async () => {
  const user = userEvent.setup()
  const onMessageSent = vi.fn()

  axiosInstance.post.mockResolvedValueOnce({
    data: {
      blocked: true,
      error: 'Message blocked by moderation.',
    },
  })

  render(
    <ChatInput
      endpoint="/chat/tournaments/1/messages/"
      onMessageSent={onMessageSent}
    />
  )

  await user.type(screen.getByPlaceholderText(/type a message/i), 'you are toxic')
  await user.click(screen.getByRole('button', { name: /send/i }))

  await waitFor(() => {
    expect(axiosInstance.post).toHaveBeenCalledWith('/chat/tournaments/1/messages/', {
      message: 'you are toxic',
    })
  })

  expect(await screen.findByText(/message blocked by moderation\./i)).toBeInTheDocument()
  expect(onMessageSent).not.toHaveBeenCalled()
})
