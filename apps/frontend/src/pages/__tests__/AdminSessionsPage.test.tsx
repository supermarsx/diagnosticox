import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSessionsPage from '../AdminSessionsPage';
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin', role: 'admin' }, token: 'admintoken', login: jest.fn(), logout: jest.fn() })
}));
import { apiService } from '../../services/apiService';

jest.mock('../../services/apiService');

describe('AdminSessionsPage', () => {
  beforeEach(() => {
    (apiService as any).requestPublic = jest.fn();
  });

  it('loads sessions and revokes', async () => {
    // set up requestPublic mock for load and revoke
    (apiService as any).requestPublic.mockImplementation((endpoint: string, opts?: any) => {
      if (endpoint.startsWith('/auth/sessions')) return Promise.resolve({ sessions: [{ sessionId: 's1', session: { userId: 'u1' } }] });
      if (endpoint === '/auth/token/revoke') return Promise.resolve({ ok: true });
      return Promise.resolve({});
    });

    render(<AdminSessionsPage />);

    // enter user id and click load
    const input = screen.getByPlaceholderText('User ID') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'u1' } });

    const loadBtn = screen.getByText('Load');
    fireEvent.click(loadBtn);

    await waitFor(() => expect(apiService.requestPublic).toHaveBeenCalled());

    expect(screen.getByText(/Session: s1/)).toBeInTheDocument();

    const revokeBtn = screen.getByText('Revoke');
    fireEvent.click(revokeBtn);

    await waitFor(() => expect(apiService.requestPublic).toHaveBeenCalledWith('/auth/token/revoke', expect.any(Object)));
  });
});
