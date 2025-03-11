import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./features/dashboard"
import UnauthorisedError from "./features/errors/unauthorized-error"
import ForbiddenError from "./features/errors/forbidden"
import NotFoundError from "./features/errors/not-found-error"
import GeneralError from "./features/errors/general-error"
import MaintenanceError from "./features/errors/maintenance-error"
import { AuthProvider } from "./provider/AuthProvider"
import ProblemCreator from "./features/problem/ProblemCreate"
import ProtectedRoute from "./provider/ProtectedRoute"
import LoginPage from "./features/auth/login"
import ForgotPassword from "./features/auth/forgot"
import ResetPassword from "./features/auth/reset"
import ProblemEdit from "./features/problem/ProblemEdit"
import ViewListCourse from "./features/course/CourseList/ViewListCourse"
import CreateCourse from "./features/course/CourseCreate/CreateCourse"
import UpdateCourse from "./features/course/CourseUpdate/UpdateCourse"
import ExamList from "./features/exam/list"
import { Toaster } from "sonner"
import { CreateExam } from "./features/exam/create"
import { EditExam } from "./features/exam/edit"

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

            {/* Protected Routes */}
            <Route path="/" element={<Dashboard />}>
              <Route path="/problem" element={<ProblemCreator />} />
              <Route path="/problem/create" element={<ProblemCreator />} />
              <Route path="/problem/:id" element={<ProblemEdit />} />

              {/* Course Page*/}
              <Route path="/course" element={<ViewListCourse />} />
              <Route path="/course/add" element={<CreateCourse />} />
              <Route path="/course/:id" element={<UpdateCourse />} />

              {/* Exam Page*/}
              <Route path="/exam" element={<ExamList />} />
              <Route path="/exam/create" element={<CreateExam />} />
              <Route path="/exam/edit/:code" element={<EditExam />} />
            </Route>
            {/* <Route element={<ProtectedRoute />}>
            </Route> */}
          </Routes>
        </div>
      </AuthProvider>
      <Toaster />
    </Router>
  )
}

export default App
