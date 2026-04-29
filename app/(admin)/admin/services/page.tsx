import { DataTable } from "@/components/admin/data-table";
import { getServices } from "@/lib/data";

export const metadata = {
  title: "Admin Services",
};

export default async function AdminServicesPage() {
  const services = await getServices(false);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Services</h2>
        <p className="text-sm text-muted-foreground">
          Configure active packages, pricing ranges, and deliverables.
        </p>
      </div>

      <DataTable
        data={services}
        columns={[
          { key: "title", header: "Title" },
          { key: "price_range", header: "Price Range" },
          {
            key: "delivery_days",
            header: "Delivery",
            render: (row) => `${String(row.delivery_days ?? 0)} days`,
          },
          {
            key: "is_active",
            header: "Active",
            render: (row) => ((row.is_active as boolean) ? "Yes" : "No"),
          },
        ]}
      />
    </div>
  );
}
