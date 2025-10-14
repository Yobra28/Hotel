import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";
import Bookings from "./pages/Bookings";
import Billing from "./pages/Billing";
import Housekeeping from "./pages/Housekeeping";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import GuestRegistration from "./pages/GuestRegistration";
import GuestSelfRegistration from "./pages/GuestSelfRegistration";
import GuestDashboard from "./pages/GuestDashboard";
import Landing from "./pages/Landing";
import GuestLogin from "./pages/GuestLogin";
import StaffAccountRequest from "./pages/StaffAccountRequest";
import FoodOrdering from "./pages/FoodOrdering";
import SwimmingActivities from "./pages/SwimmingActivities";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/guest-login" element={<GuestLogin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <Rooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guests"
              element={
                <ProtectedRoute>
                  <Guests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/housekeeping"
              element={
                <ProtectedRoute>
                  <Housekeeping />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guest-registration"
              element={
                <ProtectedRoute>
                  <GuestRegistration />
                </ProtectedRoute>
              }
            />
            <Route path="/guest-register" element={<GuestSelfRegistration />} />
            <Route path="/staff-account-request" element={<StaffAccountRequest />} />
            <Route
              path="/food-ordering"
              element={
                <ProtectedRoute>
                  <FoodOrdering />
                </ProtectedRoute>
              }
            />
            <Route
              path="/swimming-activities"
              element={
                <ProtectedRoute>
                  <SwimmingActivities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guest-dashboard"
              element={
                <ProtectedRoute>
                  <GuestDashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
