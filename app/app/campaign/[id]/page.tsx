import { AppShell } from "@/components/AppShell";
import { CampaignDetail } from "@/components/campaign/CampaignDetail";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <CampaignDetail id={id} />
    </AppShell>
  );
}
