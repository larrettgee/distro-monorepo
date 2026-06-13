"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Account, CampaignStatus, CreateCampaignInput, RegisterAccountInput } from "./types";

/** Current account ("uninitialized" until they register a type). */
export function useMyAccount() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  return useQuery<Account>({
    queryKey: ["account", "me"],
    enabled: ready && authenticated,
    queryFn: async () => api.accounts.me(await getAccessToken()),
    staleTime: 30_000,
  });
}

export function useRegisterAccount() {
  const { getAccessToken } = usePrivy();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterAccountInput) =>
      api.accounts.register(input, await getAccessToken()),
    onSuccess: (account) => qc.setQueryData(["account", "me"], account),
  });
}

/** Fetch a fresh, signed World ID rp_context (expires ~5 min) to open the widget. */
export function useWorldIdContext() {
  const { getAccessToken } = usePrivy();
  return useMutation({
    mutationFn: async () => api.accounts.worldIdContext(await getAccessToken()),
  });
}

/** Submit an IDKit proof for server-side verification; flips the account to verified. */
export function useVerifyWorldId() {
  const { getAccessToken } = usePrivy();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (proof: unknown) =>
      api.accounts.verifyWorldId(proof, await getAccessToken()),
    onSuccess: (account) => qc.setQueryData(["account", "me"], account),
  });
}

/** Public campaign listing (defaults to active on the server). */
export function useCampaigns(status?: CampaignStatus) {
  return useQuery({
    queryKey: ["campaigns", status ?? "active"],
    queryFn: () => api.campaigns.list(status),
  });
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ["campaign", id],
    enabled: !!id,
    queryFn: () => api.campaigns.get(id as string),
  });
}

export function useClipperProfile() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const { data: account } = useMyAccount();
  return useQuery({
    queryKey: ["clipper", "me"],
    enabled: ready && authenticated && account?.type === "clipper",
    queryFn: async () => api.clippers.me(await getAccessToken()),
  });
}

export function useCreateCampaign() {
  const { getAccessToken } = usePrivy();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCampaignInput) =>
      api.campaigns.create(input, await getAccessToken()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

// ─── Brand ───

/** The signed-in brand's campaigns across all statuses. */
export function useMyCampaigns() {
  const { data: account } = useMyAccount();
  const wallet = account?.walletAddress?.toLowerCase();
  return useQuery({
    queryKey: ["campaigns", "mine", wallet],
    enabled: account?.type === "brand" && !!wallet,
    queryFn: async () => {
      const lists = await Promise.all([
        api.campaigns.list("active"),
        api.campaigns.list("pending_onchain"),
        api.campaigns.list("closed"),
      ]);
      return lists.flat().filter((c) => c.brandWallet.toLowerCase() === wallet);
    },
  });
}

/** On-chain performance for a brand-owned campaign. */
export function useCampaignPerformance(id: string | undefined) {
  const { getAccessToken } = usePrivy();
  const { data: account } = useMyAccount();
  return useQuery({
    queryKey: ["campaign", id, "performance"],
    enabled: !!id && account?.type === "brand",
    queryFn: async () => api.campaigns.performance(id as string, await getAccessToken()),
  });
}

/** Submissions for a campaign (brand sees all, clipper sees own). */
export function useSubmissions(campaignId: string | undefined) {
  const { ready, authenticated, getAccessToken } = usePrivy();
  return useQuery({
    queryKey: ["submissions", campaignId],
    enabled: !!campaignId && ready && authenticated,
    queryFn: async () => api.submissions.list(campaignId as string, await getAccessToken()),
  });
}

// ─── Clipper ───

export function useConnectChannelStart() {
  const { getAccessToken } = usePrivy();
  return useMutation({
    mutationFn: async (channelUrl: string) =>
      api.clippers.connectStart(channelUrl, await getAccessToken()),
  });
}

export function useConnectChannelVerify() {
  const { getAccessToken } = usePrivy();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => api.clippers.connectVerify(await getAccessToken()),
    onSuccess: (profile) => qc.setQueryData(["clipper", "me"], profile),
  });
}

export function useSubmitVideos(campaignId: string) {
  const { getAccessToken } = usePrivy();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (videoUrls: string[]) =>
      api.submissions.create(campaignId, videoUrls, await getAccessToken()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submissions", campaignId] }),
  });
}
