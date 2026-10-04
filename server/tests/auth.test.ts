describe('Auth token guard', () => {
  it('accepts bearer tokens and rejects headers that are missing the required prefix', () => {
    const hasBearerToken = (header?: string) => Boolean(header && header.startsWith('Bearer '));

    expect(hasBearerToken('Bearer abc123')).toBe(true);
    expect(hasBearerToken('abc123')).toBe(false);
    expect(hasBearerToken(undefined)).toBe(false);
  });
});
