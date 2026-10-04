describe('Auth email handling', () => {
  it('normalizes email casing and trims spaces before matching', () => {
    const normalizeEmail = (value: unknown) => {
      if (typeof value !== 'string') {
        return '';
      }

      return value.trim().toLowerCase();
    };

    expect(normalizeEmail(' UPPER@EXAMPLE.COM ')).toBe('upper@example.com');
    expect(normalizeEmail('upper@example.com')).toBe('upper@example.com');
  });
});
