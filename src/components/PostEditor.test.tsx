import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostEditor } from './PostEditor';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  createPost: vi.fn(),
}));

describe('PostEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and text inputs', () => {
    render(<PostEditor />);
    expect(screen.getByLabelText('題名')).toBeInTheDocument();
    expect(screen.getByLabelText('本文')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '投稿する' })).toBeInTheDocument();
  });

  it('calls createPost with title and text on submit', async () => {
    vi.mocked(api.createPost).mockResolvedValue({ postId: 'test-id' });
    render(<PostEditor />);
    fireEvent.change(screen.getByLabelText('題名'), { target: { value: 'テストタイトル' } });
    fireEvent.change(screen.getByLabelText('本文'), { target: { value: 'テスト本文' } });
    fireEvent.click(screen.getByRole('button', { name: '投稿する' }));
    await waitFor(() => {
      expect(api.createPost).toHaveBeenCalledWith({ title: 'テストタイトル', text: 'テスト本文' });
    });
  });

  it('shows success message after successful post', async () => {
    vi.mocked(api.createPost).mockResolvedValue({ postId: 'test-id' });
    render(<PostEditor />);
    fireEvent.change(screen.getByLabelText('題名'), { target: { value: 'タイトル' } });
    fireEvent.change(screen.getByLabelText('本文'), { target: { value: '本文' } });
    fireEvent.click(screen.getByRole('button', { name: '投稿する' }));
    await waitFor(() => {
      expect(screen.getByText('投稿しました')).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    vi.mocked(api.createPost).mockRejectedValue(new Error('サーバーエラー'));
    render(<PostEditor />);
    fireEvent.change(screen.getByLabelText('題名'), { target: { value: 'タイトル' } });
    fireEvent.change(screen.getByLabelText('本文'), { target: { value: '本文' } });
    fireEvent.click(screen.getByRole('button', { name: '投稿する' }));
    await waitFor(() => {
      expect(screen.getByText('サーバーエラー')).toBeInTheDocument();
    });
  });
});
