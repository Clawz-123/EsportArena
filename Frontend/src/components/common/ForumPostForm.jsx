import { useMemo, useState } from 'react';
import axiosInstance from '../../axios/axiousinstance';

// Simple forum post form with toxicity blocking support
const ForumPostForm = ({
  endpoint,
  onPostCreated,
  placeholderTitle = 'Post title',
  placeholderContent = 'Write your post...',
  disabled = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmedTitle = useMemo(() => title.trim(), [title]);
  const trimmedContent = useMemo(() => content.trim(), [content]);

  const parseResponse = (payload) => {
    const result = payload?.result ?? payload?.Result ?? payload;
    const blocked = payload?.blocked ?? result?.blocked ?? false;
    const errorMessage = payload?.error ?? payload?.Error_Message ?? '';
    return { blocked, errorMessage, result };
  };

  const handleSubmit = async () => {
    if (!endpoint || !trimmedTitle || !trimmedContent || loading) return;
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post(endpoint, {
        title: trimmedTitle,
        content: trimmedContent,
      });

      const { blocked, errorMessage, result } = parseResponse(response.data || {});
      if (blocked) {
        setError(errorMessage || 'Post blocked by moderation.');
        return;
      }

      setTitle('');
      setContent('');
      if (typeof onPostCreated === 'function') {
        onPostCreated(result ?? response.data);
      }
    } catch (err) {
      const apiError = err?.response?.data;
      const messageFromApi = apiError?.error || apiError?.Error_Message || 'Unable to create post. Please try again.';
      setError(messageFromApi);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError('');
        }}
        placeholder={placeholderTitle}
        disabled={disabled || loading}
        style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #d0d0d0' }}
      />
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError('');
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholderContent}
        rows={5}
        disabled={disabled || loading}
        style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #d0d0d0', resize: 'vertical' }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || loading || !trimmedTitle || !trimmedContent}
        style={{ padding: '0.85rem 1rem', borderRadius: 8 }}
      >
        {loading ? 'Posting...' : 'Publish'}
      </button>
      {error ? (
        <div style={{ color: '#c62828', fontSize: '0.9rem' }}>{error}</div>
      ) : null}
    </div>
  );
};

export default ForumPostForm;
