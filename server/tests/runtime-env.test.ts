import { shouldSeedDemoData } from '../src/config/runtime';

describe('Runtime config', () => {
  it('disables demo seeding in production by default', () => {
    const env = { NODE_ENV: 'production', SEED_DEMO_DATA: 'false' };
    expect(shouldSeedDemoData(env)).toBe(false);
  });

  it('allows demo seeding only when explicitly enabled in non-production', () => {
    const env = { NODE_ENV: 'development', SEED_DEMO_DATA: 'true' };
    expect(shouldSeedDemoData(env)).toBe(true);
  });
});
