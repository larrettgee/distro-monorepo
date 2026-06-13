import { streamThumbnail } from "@/lib/cloudflareStream";

export const runtime = "nodejs";

// Cloudflare generates Stream thumbnails on demand, which is slow on the first
// hit. We fetch each video's thumbnail once and serve it from our own cache
// (Next data cache + immutable browser/CDN caching), so subsequent loads are
// instant and we stop hammering Cloudflare. A thumbnail for a given uid is
// stable, so we can cache it effectively forever.
const ONE_YEAR = 60 * 60 * 24 * 365;
const UID_RE = /^[0-9a-f]{32}$/i;

export async function GET(_req: Request, ctx: { params: Promise<{ uid: string }> }) {
  const { uid } = await ctx.params;
  if (!UID_RE.test(uid)) {
    return new Response("Invalid stream id", { status: 400 });
  }

  const source = streamThumbnail(uid, { width: 1280 });

  let upstream: Response;
  try {
    upstream = await fetch(source, {
      // Fetch from Cloudflare once, then serve from the Next data cache.
      cache: "force-cache",
      next: { revalidate: ONE_YEAR },
    });
  } catch {
    return new Response("Thumbnail unavailable", { status: 502 });
  }

  if (!upstream.ok) {
    // Video may still be encoding — don't cache the miss.
    return new Response("Thumbnail not ready", {
      status: upstream.status === 404 ? 404 : 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": `public, max-age=${ONE_YEAR}, immutable`,
    },
  });
}
