import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./features/dashboard"
import UnauthorisedError from "./features/errors/unauthorized-error"
import ForbiddenError from "./features/errors/forbidden"
import NotFoundError from "./features/errors/not-found-error"
import GeneralError from "./features/errors/general-error"
import MaintenanceError from "./features/errors/maintenance-error"
import { AuthProvider } from "./provider/AuthProvider"
import LoginPage from "./features/auth/login"
import ForgotPassword from "./features/auth/forgot"
import ResetPassword from "./features/auth/reset"
import { Toaster } from "sonner"
import { ProtectedRoute } from "./provider/ProtectRoute"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="mx-auto">
          <Routes>
            {/* Error Pages */}
            <Route path="/401" element={<UnauthorisedError />} />
            <Route path="/403" element={<ForbiddenError />} />
            <Route path="/404" element={<NotFoundError />} />
            <Route path="/500" element={<GeneralError />} />
            <Route path="/503" element={<MaintenanceError />} />

            {/* Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset" element={<ResetPassword />} />

            {/* Dashboard - accessible to all authenticated users */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundError />} />
          </Routes>
        </div>
      </AuthProvider>
      <Toaster richColors />
    </Router>
  )
}

export default App

