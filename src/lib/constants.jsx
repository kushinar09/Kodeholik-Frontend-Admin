import React from "react"
import logo from "@/assets/images/logo/K_nobg.png"

const LOGO = React.forwardRef(({ className, ...props }, ref) => {
  return <img src={logo} className={className} alt="Kodeholik" ref={ref} {...props} />
})

const GLOBALS = {
  APPLICATION_NAME: import.meta.env.VITE_APP_NAME,
  SPONSORS: ["FPT University"],
  REFERENCES: [
    {
      name: "Leetcode",
      link: "https://leetcode.com"
    },
    {
      name: "Hackerrank",
      link: "https://hackerrank.com"
    },
    {
      name: "Codelearn",
      link: "https://codelearn.io"
    }
  ]
}

const FRONTEND_PORT = import.meta.env.VITE_FRONTEND_PORT
const API_URL = import.meta.env.VITE_API_URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const ENDPOINTS = {
  FRONTEND: `http://localhost:${FRONTEND_PORT}`,
  // Auth
  POST_LOGIN: `${API_URL}/auth/login-admin`,
  LOGIN_GOOGLE: `${BACKEND_URL}/oauth2/authorization/google`,
  LOGIN_GITHUB: `${BACKEND_URL}/oauth2/authorization/github`,
  GET_INFOR: `${API_URL}/user/current`,
  ROTATE_TOKEN: `${API_URL}/auth/rotate-token`,
  POST_LOGOUT: `${API_URL}/auth/logout`,

  POST_FORGOT_PASSWORD: `${API_URL}/auth/reset-password-init?username=:gmail`,
  GET_CHECK_RESET_TOKEN: `${API_URL}/auth/reset-password-check?token=:token`,
  POST_RESET_PASSWORD: `${API_URL}/auth/reset-password-finish?token=:token`,

  // Problems
  POST_PROBLEMS_LIST: `${API_URL}/problem/search`,
  GET_PROBLEM_DESCRIPTION: `${API_URL}/problem/description/:id`,
  GET_PROBLEM_EDITORIAL: `${API_URL}/problem/editorial/:id`,
  GET_PROBLEM_INIT_CODE: `${API_URL}/problem/compile-information/:id`,
  GET_PROBLEM_COMMENTS: `${API_URL}/comment/problem/:id`,
  POST_COMMENT_PROBLEM: `${API_URL}/comment/post`,
  GET_PROBLEM_SOLUTIONS: `${API_URL}/problem-solution/list/:id`,
  GET_PROBLEM_SUBMISSIONS: `${API_URL}/problem/submissions/:id`,
  GET_SEARCH_PROBLEM: `${API_URL}/problem/search`,

  GET_TOPICS_PROBLEM: `${API_URL}/tag/all-topic`,
  GET_SKILLS_PROBLEM: `${API_URL}/tag/all-skill`,
  GET_STATS_PROBLEM: `${API_URL}/problem/no-achieved-info`,

  // Search
  GET_SUGGEST_SEARCH: `${API_URL}/problem/suggest?searchText=:text`,
  // courses
  GET_COURSES_LIST: `${API_URL}/course/search`,
  GET_COURSES: `${API_URL}/course/list`,
  GET_COURSE: `${API_URL}/course/detail/:id`,
  CREATE_COURSE: `${API_URL}/course/add`,
  UPDATE_COURSE: `${API_URL}/course/update/:id`,
  DELETE_COURSE: `${API_URL}/course/delete/:id`,
  ENROLL_COURSE: `${API_URL}/course/enroll/:id`,
  UNENROLL_COURSE: `${API_URL}/course/unenroll/:id`,
  RATE_COMMENT_COURSE: `${API_URL}/course/rate`,
  GET_COMMENT_COURSE: `${API_URL}/course/rating/:id`,
  CHECK_ENROLL: `${API_URL}/course/enroll/check/:id`,

  GET_USER_ENROLLED: `${API_URL}/course/enrolled-users/:id`,

  GET_COURSE_DISCUSSION: `${API_URL}/course/discussion/:id`,
  GET_DISCUSSION_REPLY: `${API_URL}/course/list-reply/:id`,
  POST_COURSE_DISCUSSION: `${API_URL}/course/comment`,
  UPVOTE_COURSE_DISCUSSION: `${API_URL}/comment/upvote/:id`,
  UN_UPVOTE_COURSE_DISCUSSION: `${API_URL}/comment/unupvote/:id`,

  //Chapter
  GET_CHAPTERS: `${API_URL}/chapter/list`,
  GET_CHAPTER_BY_COURSE_ID: `${API_URL}/chapter/by-course/:id`,
  GET_CHAPTER_DETAIL: `${API_URL}/chapter/detail/:id`,
  CREATE_CHAPTER: `${API_URL}/chapter/add`,
  UPDATE_CHAPTER: `${API_URL}/chapter/update/:id`,

  //Lesson
  GET_LESSONS: `${API_URL}/lesson/list`,
  GET_LESSON_BY_CHAPTERID: `${API_URL}/lesson/by-chapter/:id`,
  GET_LESSON_DETAIL: `${API_URL}/lesson/detail/:id`,
  CREATE_LESSON: `${API_URL}/lesson/add`,
  UPDATE_LESSON: `${API_URL}/lesson/update/:id`,

  //Topic
  GET_TOPIC_LIST: `${API_URL}/tag/all-topic`,
  GET_TOPICWITHID: `${API_URL}/tag/topic`,

  //Image
  POST_UPLOAD_IMAGE: `${API_URL}/s3/upload`,
  GET_IMAGE: (imageKey) => `${API_URL}/s3/presigned-url?key=${encodeURIComponent(imageKey)}`,

  //Exam
  POST_EXAM_LIST_FOR_EXAMINER: `${API_URL}/examiner/list`,
  GET_EXAM_DETAIL_FOR_EXAMINER: `${API_URL}/examiner/detail/`,
  GET_PRIVATE_PROBLEM_FOR_EXAMINER: `${API_URL}/examiner/private-problem`,
  DELETE_EXAM: `${API_URL}/examiner/delete/`,
  POST_CREATE_EXAM: `${API_URL}/examiner/create`,
  POST_EDIT_EXAM: `${API_URL}/examiner/edit/`,
  GET_EXAM_LIST_PARTICIPANT: `${API_URL}/examiner/list-participant/`,
  GET_EXAM_PARTICIPANT_RESULT: `${API_URL}/examiner/result/`,
  GET_EXAM_OVERVIEW: `${API_URL}/examiner/result-overview/:code`,
  GET_DOWNLOAD_EXAM_RESULT: `${API_URL}/examiner/result-excel/:code`,

  //User
  POST_USER_LIST_FOR_ADMIN: `${API_URL}/admin/list-user`,
  BAN_USER: `${API_URL}/admin/ban-user/`,
  UNBAN_USER: `${API_URL}/admin/unban-user/`,
  CREATE_USER: `${API_URL}/admin/add-user`,
  EDIT_USER: `${API_URL}/admin/edit-user/`,
  DETAIL_USER: `${API_URL}/admin/detail/`,

  //Tag
  POST_TAG_LIST_FOR_ADMIN: `${API_URL}/admin/list-tag`,
  DELETE_TAG: `${API_URL}/admin/delete-tag/`,
  ADD_TAG: `${API_URL}/admin/add-tag`,
  EDIT_TAG: `${API_URL}/admin/edit-tag/`,

  // Teacher role
  // Problem
  GET_TEACHER_PROBLEM_DETAILS: `${API_URL}/problem/basic-for-emp/:id`,
  GET_TEACHER_PROBLEM_EDITORIAL: `${API_URL}/problem/editorial-for-emp/:id`,
  GET_TEACHER_PROBLEM_TEMPLATE: `${API_URL}/problem/template-for-emp/:id`,
  GET_TEACHER_PROBLEM_TESTCASE: `${API_URL}/problem/download-testcase/:id`,

  POST_TEACHER_PROBLEMS_LIST: `${API_URL}/problem/list-problem`,
  POST_CREATE_PROBLEM: `${API_URL}/problem/add-problem`,
  POST_UPDATE_PROBLEM: `${API_URL}/problem/edit-problem/:id`,
  POST_DELETE_PROBLEM: `${API_URL}/problem/delete/:id`,
  PUT_CHANGE_STATUS_PROBLEM_ACTIVE: `${API_URL}/problem/activate-problem/:id`,
  PUT_CHANGE_STATUS_PROBLEM_DEACTIVE: `${API_URL}/problem/deactivate-problem/:id`
}


const CONSTANTS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USERNAME: "username",
  USER_ID: "uid"
}

const ROLES = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  EXAMINER: "EXAMINER"
}

export {
  LOGO,
  GLOBALS,
  ENDPOINTS,
  CONSTANTS,
  ROLES
}
