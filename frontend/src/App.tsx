import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BarbershopProvider } from "@/contexts/BarbershopContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BarbershopSelector from "./pages/BarbershopSelector";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import Clients from "./pages/Clients";
import Appointments from "./pages/Appointments";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import PDV from "./pages/PDV";
import Barbers from "./pages/Barbers";
import Reports from "./pages/Reports";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BarbershopProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Login />} />
              <Route path="/login" element={<Login />} />

              {/* Barbershop Selection */}
              <Route path="/select-barbershop" element={<BarbershopSelector />} />

              {/* Super Admin Routes */}
              <Route path="/super-admin" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/barbershop" element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Routes with Layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="clients" element={<Clients />} />
                <Route path="pdv" element={<PDV />} />
                <Route path="barbers" element={<Barbers />} />
                <Route path="services" element={<Services />} />
                <Route path="products" element={<Products />} />
                <Route path="sales" element={<Sales />} />
                <Route path="reports" element={<Reports />} />
                <Route path="admin/users" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                } />
                <Route path="admin/settings" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BarbershopProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
