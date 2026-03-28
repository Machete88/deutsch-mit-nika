import { describe, it, expect } from 'vitest';

describe('Venice AI API Key', () => {
  it('should have VENICE_API_KEY set', () => {
    const key = process.env.VENICE_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
    expect(key?.startsWith('VENICE_ADMIN_KEY_')).toBe(true);
  });

  it('should connect to Venice AI API', async () => {
    const key = process.env.VENICE_API_KEY;
    const response = await fetch('https://api.venice.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });
    expect(response.status).toBe(200);
    const data = await response.json() as { data?: unknown[] };
    expect(data.data).toBeDefined();
  }, 15000);
});
