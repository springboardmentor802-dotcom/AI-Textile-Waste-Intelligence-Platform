import {
  Users,
  Factory,
  Recycle,
  Brain,
  BarChart3,
  ClipboardList,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardCard from "@/components/dashboard/DashboardCard";
import StatsGrid from "@/components/dashboard/StatsGrid";
import SectionHeader from "@/components/dashboard/SectionHeader";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DataTable from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import QuickActions from "@/components/dashboard/QuickActions";
import SystemStatus from "@/components/dashboard/SystemStatus";

const activities = [
  {
    title: "Manufacturer uploaded 120kg Cotton Waste",
    time: "5 minutes ago",
  },
  {
    title: "Recycler accepted Pickup Request #1023",
    time: "25 minutes ago",
  },
  {
    title: "AI classified Denim Fabric with 98% confidence",
    time: "1 hour ago",
  },
  {
    title: "Monthly Sustainability Report generated",
    time: "Today",
  },
];
const columns = [
  "Name",
  "Role",
  "Status",
];

const users = [
  [
    "Anuja Sawant",
    "Administrator",
    "Active",
  ],
  [
    "ABC Textiles",
    "Manufacturer",
    "Active",
  ],
  [
    "Green Recycling",
    "Recycler",
    "Pending",
  ],
  [
    "Rahul Sharma",
    "Manager",
    "Active",
  ],
];

const monthlyWaste = [
  { month: "Jan", waste: 120 },
  { month: "Feb", waste: 180 },
  { month: "Mar", waste: 210 },
  { month: "Apr", waste: 170 },
  { month: "May", waste: 260 },
  { month: "Jun", waste: 320 },
];

function AdminDashboard() {
  return (
    <DashboardLayout>

      <SectionHeader
        title="Admin Dashboard"
        subtitle="Monitor users, textile waste operations, and AI insights."
      />

      <StatsGrid>
      
        <DashboardCard
          title="Total Users"
          value="24"
          subtitle="+3 this month"
          icon={Users}
        />

        <DashboardCard
          title="Manufacturers"
          value="8"
          subtitle="Registered"
          icon={Factory}
        />

        <DashboardCard
          title="Recyclers"
          value="5"
          subtitle="Active"
          icon={Recycle}
        />

        <DashboardCard
          title="AI Requests"
          value="152"
          subtitle="Processed"
          icon={Brain}
        />

        <DashboardCard
          title="Analytics"
          value="98%"
          subtitle="Efficiency"
          icon={BarChart3}
        />

        <DashboardCard
          title="Reports"
          value="12"
          subtitle="Pending Review"
          icon={ClipboardList}
        />

      </StatsGrid>
    {/* <RecentActivity activities={activities} />
    <DataTable
    title="Recent Users"
    columns={columns}
    data={users}
/>  
    <SystemStatus />
    <ChartCard
    title="Monthly Textile Waste Collected"
    data={monthlyWaste}
/>  
    <QuickActions /> */}

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

  {/* Left Side */}
  <div className="xl:col-span-2">
    <ChartCard
      title="Monthly Textile Waste Collected"
      data={monthlyWaste}
    />
  </div>

  {/* Right Side */}
  <div>
    <QuickActions />
  </div>

</div>

<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

  <RecentActivity activities={activities} />

  <SystemStatus />

</div>

<DataTable
  title="Recent Users"
  columns={columns}
  data={users}
/>
    </DashboardLayout>
  );
}

export default AdminDashboard; 