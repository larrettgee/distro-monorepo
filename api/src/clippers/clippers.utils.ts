import { randomBytes } from 'node:crypto';

export const CONNECT_CODE_PREFIX = 'distro-verify-';

/** Generate a unique code for the clipper to temporarily place in their YT bio. */
export function generateConnectCode(): string {
  return `${CONNECT_CODE_PREFIX}${randomBytes(8).toString('hex')}`;
}

/** Case-insensitive check that a channel bio/description contains the code. */
export function bioContainsCode(description: string, code: string): boolean {
  return description.toLowerCase().includes(code.toLowerCase());
}
