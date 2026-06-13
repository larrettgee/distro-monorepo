export const runtime = "nodejs";

const CF_API = "https://api.cloudflare.com/client/v4";
const UID_RE = /^[0-9a-f]{32}$/i;

type CfDownload = { status?: string; url?: string; percentComplete?: number };

/**
 * Cloudflare Stream MP4 downloads don't exist until they're explicitly enabled,
 * which is why the raw `.../downloads/default.mp4` URL 404s. Enabling is
 * idempotent: the first call kicks off the MP4 encode, later calls just report
 * status. We return the download URL once it's ready so the client can navigate
 * to it. The driver also fires this at upload time so it's usually ready by the
 * time a brand opens the campaign.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ uid: string }> }) {
  const { uid } = await ctx.params;
  if (!UID_RE.test(uid)) {
    return Response.json({ error: "Invalid stream id" }, { status: 400 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !token) {
    return Response.json({ error: "Cloudflare Stream is not configured" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(`${CF_API}/accounts/${accountId}/stream/${uid}/downloads`, {
      method: "POST",
      headers: { Authorization: `bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "Couldn't reach Cloudflare" }, { status: 502 });
  }

  const data = (await res.json().catch(() => null)) as { result?: { default?: CfDownload } } | null;
  const dl = data?.result?.default;
  if (!res.ok || !dl?.url) {
    return Response.json({ error: "Couldn't prepare download" }, { status: 502 });
  }

  return Response.json({
    ready: dl.status === "ready",
    url: dl.url,
    percentComplete: dl.percentComplete ?? null,
  });
}
