import { PortfolioManager } from "@/components/admin/PortfolioManager";
import { getPortfolioItems } from "@/lib/data";

export const metadata = {
  title: "Admin Portfolio",
};

export default async function AdminPortfolioPage() {
  const items = await getPortfolioItems();

  return <PortfolioManager initialItems={items} />;
}
