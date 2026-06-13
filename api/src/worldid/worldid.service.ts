import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { signRequest } from '@worldcoin/idkit-core';
import type { AppConfig } from '../config/configuration';
import type {
  WorldIdProof,
  WorldIdRpContext,
  WorldIdVerificationResult,
} from './worldid.types';

type WorldIdConfig = AppConfig['worldId'];

/**
 * World ID v4 verification.
 *
 * Flow: the frontend asks for an RP-signed context (createRpContext), shows the
 * IDKit widget, then sends the resulting proof here for server-side verification
 * against the World developer API. Verification success is determined by the
 * verify endpoint's HTTP status (its exact success body is not documented).
 */
@Injectable()
export class WorldIdService {
  private readonly logger = new Logger(WorldIdService.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  /** Build a signed rp_context for the IDKit widget (one per verification attempt). */
  createRpContext(): WorldIdRpContext {
    const cfg = this.config.get('worldId', { infer: true });
    this.assertConfigured(cfg);

    const sig = signRequest({
      signingKeyHex: cfg.signingKey,
      action: cfg.action,
      ttl: cfg.ttlSeconds,
    });

    return {
      appId: cfg.appId,
      action: cfg.action,
      environment: cfg.environment,
      rpContext: {
        rp_id: cfg.rpId,
        nonce: sig.nonce,
        created_at: sig.createdAt,
        expires_at: sig.expiresAt,
        signature: sig.sig,
      },
    };
  }

  /** Verify an IDKit v4 proof by forwarding it verbatim to the World verifier. */
  async verifyProof(proof: WorldIdProof): Promise<WorldIdVerificationResult> {
    const cfg = this.config.get('worldId', { infer: true });
    this.assertConfigured(cfg);

    const nullifier = proof.responses?.[0]?.nullifier;
    if (!nullifier) {
      throw new BadRequestException('World ID proof contained no nullifier.');
    }

    const url = `${cfg.verifyBaseUrl}/api/v4/verify/${cfg.rpId}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // Forward the proof unmodified — re-encoding/trimming invalidates it.
        body: JSON.stringify(proof),
        signal: AbortSignal.timeout(cfg.timeoutMs),
      });
    } catch (error) {
      this.logger.error(`World ID verifier unreachable: ${String(error)}`);
      throw new BadGatewayException('World ID verifier is unreachable.');
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.warn(
        `World ID verification rejected (${response.status}): ${body}`,
      );
      const detail = this.extractErrorDetail(body);
      throw new BadRequestException(
        `World ID verification failed${detail ? `: ${detail}` : ''}.`,
      );
    }

    return { verified: true, nullifier, action: proof.action };
  }

  /** Pull the `code`/`detail` out of the verifier's structured error body. */
  private extractErrorDetail(body: string): string | null {
    try {
      const parsed = JSON.parse(body) as { code?: string; detail?: string };
      return [parsed.code, parsed.detail].filter(Boolean).join(' — ') || null;
    } catch {
      return null;
    }
  }

  private assertConfigured(cfg: WorldIdConfig): void {
    if (!cfg.appId || !cfg.rpId || !cfg.signingKey || !cfg.action) {
      throw new InternalServerErrorException(
        'World ID is not configured (set WORLD_ID_APP_ID, WORLD_ID_RP_ID, WORLD_ID_ACTION, WORLD_ID_SIGNING_KEY).',
      );
    }
  }
}
