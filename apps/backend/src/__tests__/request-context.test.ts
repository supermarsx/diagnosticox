import { requestContext } from '../middleware/request-context.middleware';

describe('requestContext middleware', () => {
  it('adds x-request-id header and requestId on req', () => {
    const req: any = { headers: {} };
    const res: any = { setHeader: jest.fn(), on: jest.fn((event, cb) => {}) };
    const next = jest.fn();

    requestContext(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
    expect(next).toHaveBeenCalled();
  });
});
