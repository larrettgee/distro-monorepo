import type { ClipperAggregate } from './leaderboard.types';
import {
  assignRanks,
  estimateEarningsUsdc,
  roundUsdc,
  shortenWallet,
} from './leaderboard.utils';

describe('leaderboard.utils', () => {
  describe('roundUsdc', () => {
    it('rounds to cents', () => {
      expect(roundUsdc(304.499)).toBe(304.5);
      expect(roundUsdc(0.1 + 0.2)).toBe(0.3);
    });
  });

  describe('estimateEarningsUsdc', () => {
    it('prices views at the per-1k rate', () => {
      expect(estimateEarningsUsdc(152000, 2)).toBe(304);
      expect(estimateEarningsUsdc(500, 5)).toBe(2.5);
    });

    it('is zero with no views', () => {
      expect(estimateEarningsUsdc(0, 10)).toBe(0);
    });
  });

  describe('shortenWallet', () => {
    it('truncates long addresses', () => {
      expect(shortenWallet('0x1a2b3c4d5e6f7a8b9c0d1e2f')).toBe('0x1a2b…1e2f');
    });

    it('leaves short strings untouched', () => {
      expect(shortenWallet('0x1234')).toBe('0x1234');
    });
  });

  describe('assignRanks', () => {
    const rows: ClipperAggregate[] = [
      {
        privyId: 'b',
        username: 'beta',
        walletAddress: '0xbbbb000000000000000000000000000000000000',
        totalViews: 500,
        clipCount: 2,
        estimatedEarningsUsdc: 1,
      },
      {
        privyId: 'a',
        username: 'alpha',
        walletAddress: '0xaaaa000000000000000000000000000000000000',
        totalViews: 1500,
        clipCount: 5,
        estimatedEarningsUsdc: 3,
      },
    ];

    it('orders by views desc and stamps 1-based ranks', () => {
      const ranked = assignRanks(rows);
      expect(ranked.map((r) => r.privyId)).toEqual(['a', 'b']);
      expect(ranked.map((r) => r.rank)).toEqual([1, 2]);
    });

    it('does not mutate the input array', () => {
      const snapshot = rows.map((r) => r.privyId);
      assignRanks(rows);
      expect(rows.map((r) => r.privyId)).toEqual(snapshot);
    });

    it('falls back to a shortened wallet when username is null', () => {
      const ranked = assignRanks([
        {
          privyId: 'c',
          username: null,
          walletAddress: '0xcccc111122223333444455556666777788889999',
          totalViews: 10,
          clipCount: 1,
          estimatedEarningsUsdc: 0,
        },
      ]);
      expect(ranked[0].username).toBe('0xcccc…9999');
    });
  });
});
