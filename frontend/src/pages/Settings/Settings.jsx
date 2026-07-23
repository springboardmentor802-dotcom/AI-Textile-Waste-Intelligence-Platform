import DashboardLayout from "@/components/layout/DashboardLayout";
import SectionHeader from "@/components/dashboard/SectionHeader";

function Settings() {
  return (
    <DashboardLayout>
      <SectionHeader
        title="Settings"
        subtitle="Manage Settings."
      />
    </DashboardLayout>
  );
}

export default Settings;