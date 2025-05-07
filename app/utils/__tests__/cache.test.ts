import * as cache from '../cache';

describe('cache utils', () => {
  it('should export functions', () => {
    expect(typeof cache).toBe('object');
  });

  it('should not throw when calling getCache', async () => {
    await expect(cache.getCache('test-key')).resolves.not.toThrow();
  });

  it('should not throw when calling setCache', async () => {
    await expect(
      cache.setCache('test-key', { foo: 'bar' }, cache.CACHE_TTL.SHORT)
    ).resolves.not.toThrow();
  });

  it('should not throw when calling invalidateCache', async () => {
    await expect(cache.invalidateCache('test-*')).resolves.not.toThrow();
  });

  it('should not throw when calling getOrSetCache', async () => {
    const fetchFn = async () => ({ bar: 'baz' });
    await expect(
      cache.getOrSetCache('test-key', fetchFn, cache.CACHE_TTL.SHORT)
    ).resolves.not.toThrow();
  });
});
