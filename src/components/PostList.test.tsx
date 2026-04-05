import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostList } from './PostList';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  fetchMyPosts: vi.fn(),
  deletePost: vi.fn(),
}));

describe('PostList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.fetchMyPosts).mockResolvedValue([]);
    render(<PostList />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('renders posts after loading', async () => {
    vi.mocked(api.fetchMyPosts).mockResolvedValue([
      { postId: '1', title: 'テスト記事', text: '本文です', createdAt: '2026-04-05T10:00:00.000Z', authorSub: 'sub1' },
    ]);
    render(<PostList />);
    await waitFor(() => {
      expect(screen.getByText('テスト記事')).toBeInTheDocument();
      expect(screen.getByText('本文です')).toBeInTheDocument();
    });
  });

  it('shows empty message when no posts', async () => {
    vi.mocked(api.fetchMyPosts).mockResolvedValue([]);
    render(<PostList />);
    await waitFor(() => {
      expect(screen.getByText('投稿がありません')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    vi.mocked(api.fetchMyPosts).mockRejectedValue(new Error('ネットワークエラー'));
    render(<PostList />);
    await waitFor(() => {
      expect(screen.getByText('ネットワークエラー')).toBeInTheDocument();
    });
  });
});
