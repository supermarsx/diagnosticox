import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

export default function AdminSessionsPage() {
  const { user } = useAuth();
  const [userId, setUserId] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.requestPublic(`/auth/sessions?userId=${encodeURIComponent(userId)}` as any);
      setSessions(res.sessions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (sessionId: string) => {
    try {
      await apiService.requestPublic('/auth/token/revoke', { method: 'POST', body: JSON.stringify({ sessionId }) });
      setSessions(sessions.filter(s => s.sessionId !== sessionId));
    } catch (err: any) {
      setError(err.message || 'Failed to revoke');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Session Administration</h2>

      {user?.role !== 'admin' && (
        <div className="mb-4 text-sm text-red-700">Administrator role required to access session admin</div>
      )}

      <div className="flex gap-2 mb-4">
        <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="p-2 border rounded w-full" />
        <button className="btn-primary px-4" onClick={loadSessions} disabled={!userId || loading}>Load</button>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <div>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-3">
            {sessions.length === 0 && <div className="text-sm text-gray-600">No sessions found</div>}
            {sessions.map(s => (
              <div key={s.sessionId} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Session: {s.sessionId}</div>
                  <div className="text-xs text-gray-500">{JSON.stringify(s.session)}</div>
                </div>
                <div>
                  <button className="btn-danger px-3" onClick={() => revoke(s.sessionId)}>Revoke</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
