import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import request from 'supertest';

// Provide a mocked opentelemetry/api implementation so the dynamic import inside
// the route handlers picks it up and we can assert startActiveSpan was invoked.
const mockSpan = {
  recordException: vi.fn(),
  setStatus: vi.fn(),
  end: vi.fn(),
};

const startActiveSpan = vi.fn(async (_name: string, _opts: any, fn: any) => {
  if (typeof fn === 'function') {
    await fn(mockSpan);
  }
});

vi.mock('@opentelemetry/api', () => {
  return {
    trace: { getTracer: () => ({ startActiveSpan }) },
    SpanStatusCode: { ERROR: 2 },
  };
});

import app from '../index';

describe('Auth routes tracing integration (mocked)', () => {
  beforeEach(() => {
    startActiveSpan.mockClear();
    mockSpan.recordException.mockClear();
    mockSpan.setStatus.mockClear();
    mockSpan.end.mockClear();
  });

  afterEach(() => {
    startActiveSpan.mockClear();
  });

  test('register route attempts to start a span', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(startActiveSpan).toHaveBeenCalled();
  });

  test('login route attempts to start a span', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(startActiveSpan).toHaveBeenCalled();
  });
});
