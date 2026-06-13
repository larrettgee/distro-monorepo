import { toBaseUnits, toDisplayUnits } from './campaigns.utils';

describe('campaigns.utils', () => {
  describe('toBaseUnits', () => {
    it('converts whole USDC to 6-decimal base units', () => {
      expect(toBaseUnits(1000, 6)).toBe(1_000_000_000n);
    });
    it('handles fractional amounts without float error', () => {
      expect(toBaseUnits(2.5, 6)).toBe(2_500_000n);
      expect(toBaseUnits(0.1, 6)).toBe(100_000n);
    });
  });

  describe('toDisplayUnits', () => {
    it('round-trips base units back to a human amount', () => {
      expect(toDisplayUnits(1_000_000_000n, 6)).toBe(1000);
      expect(toDisplayUnits(2_500_000n, 6)).toBe(2.5);
    });
  });
});
