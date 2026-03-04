import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LoginPage from "@/pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/users/UsersPage";
import { GlobalToast } from "./components/ui/GlobalToast";
import RolesPage from "./pages/roles/RolesPage";
import RoleFormPage from "./pages/roles/RoleFormPage";

export default function App() {
  const { isAuthenticated, needsPasswordChange } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : needsPasswordChange ? (
              <Navigate to="/reset-password" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Application Routes */}
        <Route
          element={
            isAuthenticated && !needsPasswordChange ? (
              <MainLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* All routes inside here will automatically be wrapped by MainLayout */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/create" element={<RoleFormPage />} />
          <Route path="/roles/:id" element={<RoleFormPage />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <GlobalToast />
    </BrowserRouter>
  );
}
