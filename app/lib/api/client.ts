import type {
  Account,
  Campaign,
  CampaignPerformance,
  CampaignStatus,
  ClipperProfile,
  CreateCampaignInput,
  CreateCampaignResult,
  CreateSubmissionsResult,
  RegisterAccountInput,
  StartConnectResult,
  Submission,
  WorldIdContext,
  YoutubeChannel,
  YoutubeVideo,
} from "./types";

/** Same-origin proxy to the NestJS backend (see next.config rewrites). */
const BASE = "/api/backend";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Opts = { method?: string; body?: unknown; token?: string | null };

async function apiFetch<T>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  if (opts.token) headers["authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = Array.isArray(data?.message) ? data.message.join(", ") : (data?.message ?? message);
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Typed API surface. Authenticated calls take a Privy access token; pass
 * `await getAccessToken()` from `usePrivy()`.
 */
export const api = {
  accounts: {
    me: (token: string | null) => apiFetch<Account>("/accounts/me", { token }),
    register: (input: RegisterAccountInput, token: string | null) =>
      apiFetch<Account>("/accounts/register", { method: "POST", body: input, token }),
    worldIdContext: (token: string | null) =>
      apiFetch<WorldIdContext>("/accounts/worldid/context", { token }),
    verifyWorldId: (proof: unknown, token: string | null) =>
      apiFetch<Account>("/accounts/verify-worldid", { method: "POST", body: proof, token }),
  },
  campaigns: {
    list: (status?: CampaignStatus) =>
      apiFetch<Campaign[]>(`/campaigns${status ? `?status=${status}` : ""}`),
    get: (id: string) => apiFetch<Campaign>(`/campaigns/${id}`),
    create: (input: CreateCampaignInput, token: string | null) =>
      apiFetch<CreateCampaignResult>("/campaigns", { method: "POST", body: input, token }),
    confirm: (id: string, txHash: string, token: string | null) =>
      apiFetch<Campaign>(`/campaigns/${id}/confirm`, { method: "POST", body: { txHash }, token }),
    performance: (id: string, token: string | null) =>
      apiFetch<CampaignPerformance>(`/campaigns/${id}/performance`, { token }),
  },
  clippers: {
    me: (token: string | null) => apiFetch<ClipperProfile>("/clippers/me", { token }),
    connectStart: (channelUrl: string, token: string | null) =>
      apiFetch<StartConnectResult>("/clippers/channel/connect/start", {
        method: "POST",
        body: { channelUrl },
        token,
      }),
    connectVerify: (token: string | null) =>
      apiFetch<ClipperProfile>("/clippers/channel/connect/verify", { method: "POST", token }),
  },
  submissions: {
    create: (campaignId: string, videoUrls: string[], token: string | null) =>
      apiFetch<CreateSubmissionsResult>(`/campaigns/${campaignId}/submissions`, {
        method: "POST",
        body: { videoUrls },
        token,
      }),
    list: (campaignId: string, token: string | null) =>
      apiFetch<Submission[]>(`/campaigns/${campaignId}/submissions`, { token }),
  },
  youtube: {
    video: (url: string) =>
      apiFetch<YoutubeVideo>(`/youtube/videos?url=${encodeURIComponent(url)}`),
    channel: (url: string) =>
      apiFetch<YoutubeChannel>(`/youtube/channels?url=${encodeURIComponent(url)}`),
  },
};
