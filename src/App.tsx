import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminGuard from "@/components/AdminGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import NotesPage from "./pages/dashboard/NotesPage";
import EventsPage from "./pages/dashboard/EventsPage";
import InternshipsPage from "./pages/dashboard/InternshipsPage";
import ComplaintsPage from "./pages/dashboard/ComplaintsPage";
import AnnouncementsPage from "./pages/dashboard/AnnouncementsPage";
import ClubsPage from "./pages/dashboard/ClubsPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import AdminNotesPage from "./pages/dashboard/admin/AdminNotesPage";
import AdminInternshipsPage from "./pages/dashboard/admin/AdminInternshipsPage";
import AdminComplaintsPage from "./pages/dashboard/admin/AdminComplaintsPage";
import AdminAnnouncementsPage from "./pages/dashboard/admin/AdminAnnouncementsPage";
import AdminEventsPage from "./pages/dashboard/admin/AdminEventsPage";
import AdminClubsPage from "./pages/dashboard/admin/AdminClubsPage";
import CampusBot from "./components/CampusBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CampusBot />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="internships" element={<InternshipsPage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="clubs" element={<ClubsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              {/* Admin routes */}
              <Route path="admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="admin/notes" element={<AdminGuard><AdminNotesPage /></AdminGuard>} />
              <Route path="admin/internships" element={<AdminGuard><AdminInternshipsPage /></AdminGuard>} />
              <Route path="admin/events" element={<AdminGuard><AdminEventsPage /></AdminGuard>} />
              <Route path="admin/complaints" element={<AdminGuard><AdminComplaintsPage /></AdminGuard>} />
              <Route path="admin/announcements" element={<AdminGuard><AdminAnnouncementsPage /></AdminGuard>} />
              <Route path="admin/clubs" element={<AdminGuard><AdminClubsPage /></AdminGuard>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
