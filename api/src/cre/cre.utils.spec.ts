import { aggregateByWallet, utcDateKey } from './cre.utils';

describe('cre.utils', () => {
  describe('utcDateKey', () => {
    it('formats a UTC day key (YYYY-MM-DD)', () => {
      expect(utcDateKey(new Date('2026-06-13T23:59:59.000Z'))).toBe(
        '2026-06-13',
      );
    });

    it('uses UTC, not local time', () => {
      // 00:30 UTC is still the same UTC day regardless of local offset.
      expect(utcDateKey(new Date('2026-06-13T00:30:00.000Z'))).toBe(
        '2026-06-13',
      );
    });
  });

  describe('aggregateByWallet', () => {
    it('sums views per wallet (cumulative per recipient)', () => {
      const result = aggregateByWallet([
        { wallet: '0xaaa', views: 100 },
        { wallet: '0xbbb', views: 50 },
        { wallet: '0xaaa', views: 25 }, // same wallet, second clip
      ]);
      expect(result).toEqual([
        { wallet: '0xaaa', cumulativeViews: 125 },
        { wallet: '0xbbb', cumulativeViews: 50 },
      ]);
    });

    it('returns recipients sorted by wallet for deterministic batches', () => {
      const result = aggregateByWallet([
        { wallet: '0xccc', views: 1 },
        { wallet: '0xaaa', views: 1 },
        { wallet: '0xbbb', views: 1 },
      ]);
      expect(result.map((r) => r.wallet)).toEqual(['0xaaa', '0xbbb', '0xccc']);
    });

    it('handles an empty input', () => {
      expect(aggregateByWallet([])).toEqual([]);
    });
  });
});
