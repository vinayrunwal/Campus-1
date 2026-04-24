import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/dashboard/AppSidebar";

const DashboardLayout = () => (
  <div className="flex min-h-screen w-full bg-background">
    <AppSidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        <Outlet />
      </div>
    </main>
  </div>
);

export default DashboardLayout;
