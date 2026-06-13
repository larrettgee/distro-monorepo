export const runtime = "nodejs";

const CF_API = "https://api.cloudflare.com/client/v4";

/**
 * Merge a server-enforced `maxDurationSeconds` into the client's tus
 * Upload-Metadata (a comma-separated list of `key base64(value)` pairs).
 * We strip any client-supplied value so the cap can't be bypassed.
 */
function buildMetadata(incoming: string | null, maxDurationSeconds: number) {
  const pairs = (incoming ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((p) => !p.startsWith("maxDurationSeconds"));
  pairs.push(`maxDurationSeconds ${Buffer.from(String(maxDurationSeconds)).toString("base64")}`);
  return pairs.join(",");
}

/**
 * Creates a one-time Cloudflare Stream direct-creator upload (tus) and returns
 * the upload URL in the `Location` header. tus-js-client in the browser then
 * uploads the file straight to Cloudflare.
 */
export async function POST(req: Request) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !token) {
    return new Response("Cloudflare Stream is not configured", { status: 500 });
  }

  const uploadLength = req.headers.get("upload-length");
  if (!uploadLength) {
    return new Response("Missing Upload-Length header", { status: 400 });
  }

  // TODO(auth): verify the Privy access token (Authorization: Bearer <token>)
  // and associate this upload with the signed-in brand BEFORE creating it.
  // This route is currently unauthenticated — gate it before any public deploy.

  const maxDuration = Number(process.env.CLOUDFLARE_STREAM_MAX_DURATION ?? 7200);
  const metadata = buildMetadata(req.headers.get("upload-metadata"), maxDuration);

  const cf = await fetch(`${CF_API}/accounts/${accountId}/stream?direct_user=true`, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": uploadLength,
      "Upload-Metadata": metadata,
    },
  });

  if (cf.status !== 201) {
    const detail = await cf.text();
    return new Response(`Cloudflare error (${cf.status}): ${detail}`, { status: 502 });
  }

  const headers = new Headers({ "Tus-Resumable": "1.0.0" });
  const location = cf.headers.get("location");
  const mediaId = cf.headers.get("stream-media-id");
  if (location) headers.set("Location", location);
  if (mediaId) headers.set("stream-media-id", mediaId);
  headers.set("Access-Control-Expose-Headers", "Location, stream-media-id, Tus-Resumable");

  return new Response(null, { status: 201, headers });
}
