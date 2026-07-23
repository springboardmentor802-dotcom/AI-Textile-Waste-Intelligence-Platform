import DashboardLayout from "@/components/layout/DashboardLayout";
import SectionHeader from "@/components/dashboard/SectionHeader";

function Users() {
  return (
    <DashboardLayout>
      <SectionHeader
        title="Analytics"
        subtitle="Analyse the waste"
      />
    </DashboardLayout>
  );
}

export default Users;