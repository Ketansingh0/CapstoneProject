const API_BASE = process.env.REACT_APP_API_URL ?? '';

async function request(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const res = await fetch(url, { credentials: 'include', ...opts, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

function authRequest(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  return request(path, { ...opts, headers });
}

export const AuthAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: async (data: { email: string; password: string }) => {
    const res = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
    if (res?.token) localStorage.setItem('token', res.token);
    return res;
  },

  me: () => authRequest('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    return request('/api/auth/logout', { method: 'POST' });
  },
};

export const NotesAPI = {
  list: (params?: { view?: 'all' | 'public' | 'private' | 'byCategory'; categoryId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.view) qs.set('view', params.view)
    if (params?.categoryId) qs.set('categoryId', params.categoryId)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return authRequest(`/api/notes${suffix}`)
  },
  create: (payload: any) => authRequest('/api/notes', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id: string) => authRequest(`/api/notes/${id}`),
  update: (id: string, payload: any) => authRequest(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id: string) => authRequest(`/api/notes/${id}`, { method: 'DELETE' }),
};

export const SearchAPI = {
  search: (filters: any) => authRequest('/api/search', { method: 'POST', body: JSON.stringify(filters) }),
};

export const AIAPI = {
  summary: (data: { title?: string; content: string }) => authRequest('/api/ai/summary', { method: 'POST', body: JSON.stringify(data) }),
  quiz: (data: { title?: string; content: string }) => authRequest('/api/ai/quiz', { method: 'POST', body: JSON.stringify(data) }),
};

export const UploadAPI = {
  upload: (formData: FormData) =>
    authRequest('/api/upload', { method: 'POST', body: formData }),
  delete: (attachmentId: string) =>
    authRequest(`/api/upload?id=${attachmentId}`, { method: 'DELETE' }),
};

export const ShareAPI = {
  share: (noteId: string, data: { sharedWithEmail?: string; permissions?: string; expiresInDays?: number }) =>
    authRequest(`/api/notes/${noteId}/share`, { method: 'POST', body: JSON.stringify(data) }),
  getShares: (noteId: string) =>
    authRequest(`/api/notes/${noteId}/share`, { method: 'GET' }),
  getShared: (token: string) =>
    request(`/api/shared/${token}`, { method: 'GET' }),
  updateShared: (token: string, content: string) =>
    request(`/api/shared/${token}`, { method: 'POST', body: JSON.stringify({ content }) }),
};

export const AuthAPIExtended = {
  ...AuthAPI,
  verify: (token: string) =>
    request('/api/auth/verify', { method: 'POST', body: JSON.stringify({ token }) }),
  forgotPassword: (email: string) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};

export const CategoriesAPI = {
  list: () => authRequest('/api/categories'),
  create: (data: { name: string; parentId?: string | null }) =>
    authRequest('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  rename: (id: string, name: string) =>
    authRequest(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  move: (id: string, parentId: string | null) =>
    authRequest(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ parentId }) }),
  delete: (id: string) => authRequest(`/api/categories/${id}`, { method: 'DELETE' }),
}
