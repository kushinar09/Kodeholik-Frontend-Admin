import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import Dashboard from "./features/dashboard"
import UnauthorisedError from "./features/errors/unauthorized-error"
import ForbiddenError from "./features/errors/forbidden"
import NotFoundError from "./features/errors/not-found-error"
import GeneralError from "./features/errors/general-error"
import MaintenanceError from "./features/errors/maintenance-error"
import { AuthProvider } from "./provider/AuthProvider"
import ProblemCreator from "./features/problem/ProblemCreate"

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

            {/* Protected Routes */}
            <Route path="/" element={<Dashboard />}>
              <Route path="/problem/create" element={<ProblemCreator />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
      <Toaster />
    </Router>
  )
}

export default App
