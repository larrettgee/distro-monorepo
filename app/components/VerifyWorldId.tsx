"use client";

import { useState } from "react";
import Image from "next/image";
import { IDKitRequestWidget, proofOfHuman, type IDKitResult } from "@worldcoin/idkit";
import { useMyAccount, useVerifyWorldId, useWorldIdContext } from "@/lib/api/hooks";
import type { WorldIdContext } from "@/lib/api/types";

function Wordmark() {
  return (
    <Image
      src="/world-wordmark.svg"
      alt="World"
      width={143}
      height={36}
      className="h-4 w-auto"
    />
  );
}

/**
 * "Verify with World ID" control for the account dropdown. Renders nothing
 * until the user has registered an account; shows a verified badge once done.
 * Flow: fetch a fresh signed rp_context → open the IDKit widget → forward the
 * proof to the backend for verification → account flips to verified.
 */
export function VerifyWorldId() {
  const { data: account } = useMyAccount();
  const context = useWorldIdContext();
  const verify = useVerifyWorldId();
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<WorldIdContext | null>(null);

  // Don't get in the way of logged-out / uninitialized users.
  if (!account?.initialized) return null;

  if (account.verificationStatus === "verified") {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-distro/30 bg-distro/10 px-3 py-2 text-sm font-medium text-distro">
        <span aria-hidden>✓</span> Verified with <Wordmark />
      </div>
    );
  }

  async function start() {
    verify.reset();
    const fresh = await context.mutateAsync();
    setCtx(fresh);
    setOpen(true);
  }

  const error = context.error ?? verify.error;

  return (
    <div className="mt-4">
      <button
        onClick={start}
        disabled={context.isPending || verify.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-cloud transition-colors hover:border-distro/50 hover:text-distro disabled:opacity-60"
      >
        {context.isPending ? (
          "Preparing…"
        ) : verify.isPending ? (
          "Verifying…"
        ) : (
          <>
            Verify with <Wordmark />
          </>
        )}
      </button>

      <p className="mt-1 text-center text-xs text-cloud/40">
        Prove you’re a unique human to unlock payouts.
      </p>

      {error && (
        <p className="mt-1 text-xs text-amber-300">
          {(error as Error).message}
        </p>
      )}

      {ctx && (
        <IDKitRequestWidget
          app_id={ctx.appId as `app_${string}`}
          action={ctx.action}
          rp_context={ctx.rpContext}
          environment={ctx.environment}
          allow_legacy_proofs={false}
          preset={proofOfHuman()}
          open={open}
          onOpenChange={setOpen}
          handleVerify={async (result: IDKitResult) => {
            // Throws on failure → the widget surfaces the error state.
            await verify.mutateAsync(result);
          }}
          onSuccess={() => setOpen(false)}
        />
      )}
    </div>
  );
}
