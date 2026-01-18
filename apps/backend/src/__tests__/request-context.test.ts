import { describe, it, expect, vi } from 'vitest';
import { requestContext } from '../middleware/request-context.middleware';

describe('requestContext middleware', () => {
  it('adds x-request-id header and requestId on req', () => {
    const req: any = { headers: {} };
    const res: any = { setHeader: vi.fn(), on: vi.fn((event, cb) => {}) };
    const next = vi.fn();

    requestContext(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
    expect(next).toHaveBeenCalled();
  });
});
