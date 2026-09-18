import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import ProviderDetails from "./pages/ProviderDetails";
import Booking from "./pages/Booking";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-8 text-sm text-slate-500 md:flex-row lg:px-8">
          <div>
            <span className="font-black text-slate-900">LocalFix</span> — Local
            Services Marketplace
          </div>
        </div>
      </footer>
    </>
  );
}

function DashboardRedirect() {
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" />

          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/providers/:id" element={<ProviderDetails />} />

              <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
                <Route path="/customer" element={<CustomerDashboard />} />
                <Route path="/book/:id" element={<Booking />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["provider"]} />}>
                <Route path="/provider" element={<ProviderDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
