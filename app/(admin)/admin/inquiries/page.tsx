import { InquiriesManager } from "@/components/admin/InquiriesManager";
import { getInquiries } from "@/lib/data";

export const metadata = {
  title: "Admin Inquiries",
};

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries(100);

  return <InquiriesManager initialInquiries={inquiries} />;
}
