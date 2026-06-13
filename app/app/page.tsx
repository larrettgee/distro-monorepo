import { Sidebar } from "@/components/Sidebar";
import { Marketplace } from "@/components/Marketplace";

export default function Home() {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <Marketplace />
    </div>
  );
}
