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
import { CreateExam } from "./features/exam/create"
import { EditExam } from "./features/exam/edit"
import UserList from "./features/users/list"
import CreateUser from "./features/users/create"
import EditUser from "./features/users/edit"
import TagList from "./features/tag/list"
import { ExamResult } from "./features/exam/result"
import ChapterList from "./features/chapter/ChapterList/ChapterList"
import CreateChapter from "./features/chapter/ChapterCreate/CreateChapter"
import UpdateChapter from "./features/chapter/ChapterUpdate/UpdateChapter"
import LessonList from "./features/lesson/LessonList/LessonList"
import CreateLesson from "./features/lesson/LessonCreate"
import UpdateLesson from "./features/lesson/LessonUpdate"

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

              {/* Exam Page*/}
              <Route path="/exam" element={<ExamList />} />
              <Route path="/exam/create" element={<CreateExam />} />
              <Route path="/exam/edit/:code" element={<EditExam />} />
              <Route path="/exam/result/:code" element={<ExamResult />} />

              {/* User Page*/}
              <Route path="/user" element={<UserList />} />
              <Route path="/user/create" element={<CreateUser />} />
              <Route path="/user/edit/:id" element={<EditUser />} />

              {/* Tag Page*/}
              <Route path="/tag" element={<TagList />} />

              {/* Course Page*/}
              <Route path="/course" element={<ViewListCourse />} />
              <Route path="/course/add" element={<CreateCourse />} />
              <Route path="/course/:id" element={<UpdateCourse />} />

              {/* Chapter Page */}
              <Route path="/chapter" element={<ChapterList />} />
              <Route path="/chapter/add" element={<CreateChapter />} />
              <Route path="/chapter/:id" element={<UpdateChapter />} />

              {/* Lesson Page */}
              <Route path="/lesson" element={<LessonList />} />
              <Route path="/lesson/add" element={<CreateLesson />} />
              <Route path="/lesson/:id" element={<UpdateLesson />} />
            </Route>
            <Route path="*" element={<NotFoundError />} />
          </Routes>
        </div>
      </AuthProvider>
      <Toaster richColors />
    </Router>
  )
}

export default App

