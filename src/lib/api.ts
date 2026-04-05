import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../amplify_outputs.json';

export interface Post {
  postId: string;
  title: string;
  text: string;
  createdAt: string;
  authorSub: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getApiUrl = (): string => (outputs as any).custom?.apiUrl ?? '';

async function getAuthToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error('認証トークンが取得できません');
  return token;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const baseUrl = getApiUrl().replace(/\/$/, '');
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${response.status}`);
  }
  return response;
}

export async function createPost(data: { title: string; text: string }): Promise<{ postId: string }> {
  const res = await apiFetch('/posts', { method: 'POST', body: JSON.stringify(data) });
  return res.json() as Promise<{ postId: string }>;
}

export async function fetchMyPosts(): Promise<Post[]> {
  const res = await apiFetch('/posts');
  return res.json() as Promise<Post[]>;
}

export async function deletePost(postId: string): Promise<void> {
  await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
}
