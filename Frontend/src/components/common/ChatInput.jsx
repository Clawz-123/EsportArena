import { useCallback, useMemo, useState } from 'react';
import axiosInstance from '../../axios/axiousinstance';

// Reusable chat input with toxicity awareness
const ChatInput = ({
  endpoint,
  onMessageSent,
  placeholder = 'Type a message...',
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmed = useMemo(() => message.trim(), [message]);

  const parseResponse = (payload) => {
    // Backend may wrap result; normalize shape
    const result = payload?.result ?? payload?.Result ?? payload;
    const blocked = payload?.blocked ?? result?.blocked ?? false;
    const errorMessage = payload?.error ?? payload?.Error_Message ?? '';
    return { blocked, errorMessage, result };
  };

  const handleSend = useCallback(async () => {
    if (!trimmed || loading || !endpoint) return;
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post(endpoint, { message: trimmed });
      const { blocked, errorMessage, result } = parseResponse(response.data || {});

      if (blocked) {
        setError(errorMessage || 'Message blocked by moderation.');
        return;
      }

      setMessage('');
      if (typeof onMessageSent === 'function') {
        onMessageSent(result ?? response.data);
      }
    } catch (err) {
      const apiError = err?.response?.data;
      const messageFromApi = apiError?.error || apiError?.Error_Message || 'Unable to send message. Please try again.';
      setError(messageFromApi);
    } finally {
      setLoading(false);
    }
  }, [endpoint, loading, onMessageSent, trimmed]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          style={{
            flex: 1,
            padding: '0.85rem 1rem',
            borderRadius: 10,
            border: '1px solid #2a3345',
            background: '#0f172a',
            color: '#e5e7eb',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || loading || !trimmed}
          style={{
            minWidth: 110,
            padding: '0.85rem 1rem',
            borderRadius: 10,
            border: 'none',
            background: disabled || loading || !trimmed ? '#1f2937' : '#2563eb',
            color: disabled || loading || !trimmed ? '#4b5563' : '#ffffff',
            cursor: disabled || loading || !trimmed ? 'not-allowed' : 'pointer',
            transition: 'background 120ms ease',
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      {error ? (
        <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>
      ) : null}
    </div>
  );
};

export default ChatInput;
