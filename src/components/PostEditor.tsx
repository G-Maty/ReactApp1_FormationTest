import { useState, type FormEvent } from 'react';
import { createPost } from '../lib/api';

export function PostEditor() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createPost({ title: title.trim(), text: text.trim() });
      setTitle('');
      setText('');
      setSuccess(true);
      window.dispatchEvent(new CustomEvent('post-created'));
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <h2>新規投稿</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: 4 }}>題名</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="題名を入力"
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="text" style={{ display: 'block', marginBottom: 4 }}>本文</label>
          <textarea
            id="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="本文を入力"
            rows={6}
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>投稿しました</p>}
        <button type="submit" disabled={loading}>
          {loading ? '投稿中...' : '投稿する'}
        </button>
      </form>
    </section>
  );
}
