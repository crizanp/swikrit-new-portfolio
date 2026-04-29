import { ServicesManager } from "@/components/admin/ServicesManager";
import { getServices } from "@/lib/data";

export const metadata = {
  title: "Admin Services",
};

export default async function AdminServicesPage() {
  const services = await getServices(false);

  return <ServicesManager initialServices={services} />;
}
