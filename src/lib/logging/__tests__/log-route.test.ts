import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/log/route';
import * as otelLogger from '@/lib/logging/otel-logger';

const mockRequest = (payload: unknown) =>
  new Request('http://localhost/api/log', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });

vi.mock('@/lib/logging/otel-logger', () => ({
  logWithLevel: vi.fn(),
}));

const { logWithLevel } = otelLogger as { logWithLevel: ReturnType<typeof vi.fn> };

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/log', () => {
  it('validates payload and forwards to otel logger', async () => {
    const request = mockRequest({
      level: 'error',
      message: 'Client crash',
      attributes: { page: '/dashboard' },
      stack: 'Error: boom',
    });

    const response = await POST(request as unknown as Request);

    expect(response.status).toBe(204);
    expect(logWithLevel).toHaveBeenCalledWith('error', 'Client crash', {
      page: '/dashboard',
      stack: 'Error: boom',
    });
  });

  it('returns 400 for invalid payload', async () => {
    const request = mockRequest({ message: '' });

    const response = await POST(request as unknown as Request);

    expect(response.status).toBe(400);
    expect(logWithLevel).not.toHaveBeenCalled();
  });
});
