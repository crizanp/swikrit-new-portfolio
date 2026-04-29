import { DataTable } from "@/components/admin/data-table";
import { getInquiries } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin Inquiries",
};

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries(100);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Contact Inquiries</h2>
        <p className="text-sm text-muted-foreground">
          Review incoming project requests and update their status.
        </p>
      </div>

      <DataTable
        data={inquiries}
        columns={[
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "budget", header: "Budget" },
          { key: "project_type", header: "Project Type" },
          {
            key: "created_at",
            header: "Received",
            render: (row) => formatDate((row.created_at as string) ?? null),
          },
          { key: "status", header: "Status" },
        ]}
      />
    </div>
  );
}
