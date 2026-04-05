import { useState, useEffect, useCallback } from 'react';
import { fetchMyPosts, deletePost, type Post } from '../lib/api';

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyPosts();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const handler = () => void load();
    window.addEventListener('post-created', handler);
    return () => window.removeEventListener('post-created', handler);
  }, [load]);

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return;
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p.postId !== postId));
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <section>
      <h2>投稿一覧（自分の投稿）</h2>
      {posts.length === 0 ? (
        <p>投稿がありません</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map(post => (
            <li key={post.postId} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px' }}>{post.title}</h3>
                  <p style={{ margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>{post.text}</p>
                  <small style={{ color: '#888' }}>{new Date(post.createdAt).toLocaleString('ja-JP')}</small>
                </div>
                <button
                  onClick={() => void handleDelete(post.postId)}
                  style={{ marginLeft: 16, color: 'red' }}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
