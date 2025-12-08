import { cacheService } from './cache.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * SessionService
 *
 * Small session store that uses the cache layer (Redis preferred) to persist
 * short-lived sessions. These sessions are used by the prototype OIDC/PKCE
 * flow and are not a replacement for a full session management / OAuth server.
 */
export class SessionService {
  private prefix = 'session:';

  /**
   * Create a new session store entry and return the session id.
   *
   * @param payload - arbitrary session payload (user info, role, organization)
   * @param ttlSeconds - optional TTL in seconds for the session entry
   */
  async createSession(payload: any, ttlSeconds = 3600): Promise<string> {
    const id = uuidv4();
    await cacheService.set(this.prefix + id, JSON.stringify(payload), ttlSeconds);
    return id;
  }

  /**
   * Retrieve a session by id. Returns parsed object or null.
   */
  async getSession(id: string): Promise<any | null> {
    const raw = await cacheService.get(this.prefix + id);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  /**
   * Remove session data for a given session id.
   */
  async destroySession(id: string): Promise<void> {
    await cacheService.del(this.prefix + id);
  }
}

export const sessionService = new SessionService();
