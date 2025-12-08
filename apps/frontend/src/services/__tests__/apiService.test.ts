import { apiService } from '../apiService';

describe('apiService refresh flow', () => {
  beforeEach(() => {
    // reset storage and internal state
    localStorage.clear();
    (apiService as any).token = null;
    (apiService as any).refreshToken = null;
    global.fetch = jest.fn();
  });

  it('stores refresh token returned by login', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 'u1' }, token: 't1', refreshToken: 'r1' }) });
    const res = await apiService.login('a@b.com', 'pw');
    expect((apiService as any).token).toBeTruthy();
    expect(localStorage.getItem('auth_token')).toBeTruthy();
    expect(localStorage.getItem('refresh_token')).toBeTruthy();
  });

  it('refreshes token and retries on 401', async () => {
    // First request returns 401
    (global.fetch as jest.Mock)
      // first call (request) -> 401
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) })
      // second call (refresh endpoint) -> 200 with new tokens
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'new-token', refreshToken: 'new-refresh' }) })
      // third call (retry original request) -> success
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: 'ok' }) });

    // seed refresh token
    (apiService as any).refreshToken = 'old-refresh';

    const data = await (apiService as any).request('/some-endpoint');
    expect(data).toHaveProperty('result', 'ok');
    expect((apiService as any).token).toBe('new-token');
    expect((apiService as any).refreshToken).toBe('new-refresh');
  });

  it('clears tokens and redirects when refresh fails', async () => {
    // first request returns 401
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) })
      // refresh returns 401 (failed)
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'Refresh failed' }) });

    (apiService as any).refreshToken = 'expired-refresh';

    // spy on clearToken (which will redirect in app), avoid actual redirect by mocking location
    delete (window as any).location;
    (window as any).location = { href: '' };

    await expect((apiService as any).request('/some-endpoint')).rejects.toThrow('Unauthorized');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});
