import React from "react"
import logo from "@/assets/images/logo/kodeholik_logo.png"

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

const API_URL = import.meta.env.VITE_API_URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const ENDPOINTS = {
  // Auth
  POST_LOGIN: `${API_URL}/auth/login`,
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
  POST_CREATE_PROBLEM: `${API_URL}/problem/create`,
  POST_UPDATE_PROBLEM: `${API_URL}/problem/update/:id`,
  POST_DELETE_PROBLEM: `${API_URL}/problem/delete/:id`,

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

  //Topic
  GET_TOPIC_LIST: `${API_URL}/tag/all-topic`,
  GET_tOPICWITHID: `${API_URL}/tag/topic`,

  //image
  GET_IMAGE: (imageKey) => `${API_URL}/s3/presigned-url?key=${encodeURIComponent(imageKey)}`,

  // code
  POST_RUN_CODE: `${API_URL}/problem-submission/run/:id`,
  POST_SUBMIT_CODE: `${API_URL}/problem-submission/submit/:id`,

  //Exam
  POST_EXAM_LIST_FOR_EXAMINER: `${API_URL}/examiner/list`,
  GET_EXAM_DETAIL_FOR_EXAMINER: `${API_URL}/examiner/detail/`
}


const CONSTANTS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USERNAME: "username",
  USER_ID: "uid"
}

export {
  LOGO,
  GLOBALS,
  ENDPOINTS,
  CONSTANTS
}
