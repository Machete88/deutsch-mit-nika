import { describe, it, expect } from 'vitest';

describe('Manus API Key', () => {
  it('should have MANUS_API_KEY set', () => {
    const key = process.env.MANUS_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
    expect(key?.startsWith('sk-')).toBe(true);
  });
});
