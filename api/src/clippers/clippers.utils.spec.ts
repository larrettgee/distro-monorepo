import {
  CONNECT_CODE_PREFIX,
  bioContainsCode,
  generateConnectCode,
} from './clippers.utils';

describe('clippers.utils', () => {
  it('generates unique prefixed codes', () => {
    const a = generateConnectCode();
    const b = generateConnectCode();
    expect(a).toMatch(new RegExp(`^${CONNECT_CODE_PREFIX}[0-9a-f]{16}$`));
    expect(a).not.toBe(b);
  });

  it('matches a code present in the bio (case-insensitive)', () => {
    const code = 'distro-verify-abc123';
    expect(bioContainsCode(`hello ${code.toUpperCase()} world`, code)).toBe(true);
    expect(bioContainsCode('no code here', code)).toBe(false);
  });
});
