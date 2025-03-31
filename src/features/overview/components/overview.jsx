"use client"

import { useState } from "react"
import { ArrowUpRight, Award, BookOpen, CheckCircle, Code, FileCode, SquareArrowOutUpRight, Star, Users } from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OverviewTeacher({ type, data }) {
  // Function to render star rating
  const renderStarRating = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-4 w-4 text-muted-foreground" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-muted-foreground" />)
      }
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
      </div>
    )
  }

  // Helper function to check if data is course data
  const isCourseData = (data) => {
    return "totalCourseCount" in data
  }

  // Helper function to check if data is challenge data
  const isChallengeData = (data) => {
    return "totalProblemCount" in data
  }

  // For challenges view
  const [activeIndex, setActiveIndex] = useState(0)
  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  // Prepare data for charts if it's challenge data
  const prepareChallengeChartData = (data) => {
    const difficultyData = data.noAchivedInformationList.slice(0, 3).map((item) => ({
      name: item.name.charAt(0) + item.name.slice(1).toLowerCase(),
      total: item.noTotal,
      solved: item.noAchived,
      remaining: item.noTotal - item.noAchived,
      percentage: (item.noAchived / item.noTotal) * 100
    }))

    const pieData = data.noAchivedInformationList.slice(0, 3).map((item) => ({
      name: item.name.charAt(0) + item.name.slice(1).toLowerCase(),
      value: item.noTotal
    }))

    const acceptanceRateData = [...data.topPopularProblems].map((problem) => ({
      name: problem.title.length > 10 ? problem.title.substring(0, 10) + "..." : problem.title,
      rate: problem.avgAcceptanceRate,
      submissions: problem.totalSubmissions
    }))

    const radarData = [
      { subject: "Easy", A: (difficultyData[0].solved / difficultyData[0].total) * 100, fullMark: 100 },
      { subject: "Medium", A: (difficultyData[1].solved / difficultyData[1].total) * 100, fullMark: 100 },
      { subject: "Hard", A: (difficultyData[2].solved / difficultyData[2].total) * 100, fullMark: 100 },
      { subject: "Submissions", A: data.totalSubmissions / 1000, fullMark: 100 },
      { subject: "Acceptance", A: data.avgAcceptanceRate, fullMark: 100 }
    ]

    return { difficultyData, pieData, acceptanceRateData, radarData }
  }

  // Render the challenges view
  const renderChallengesView = (data) => {
    const COLORS = ["#4ade80", "#facc15", "#f87171"]
    const { difficultyData, pieData } = prepareChallengeChartData(data)

    return (
      <>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
              <FileCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalProblemCount}</div>
              <p className="text-xs text-muted-foreground">Available challenges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalSubmissions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all problems</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Acceptance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.avgAcceptanceRate}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.noAchivedInformationList[3].noAchived}</div>
              <p className="text-xs text-muted-foreground">Out of {data.noAchivedInformationList[3].noTotal}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Problem Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Distribution</CardTitle>
              <CardDescription>By difficulty level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={(props) => {
                        const RADIAN = Math.PI / 180
                        const {
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          startAngle,
                          endAngle,
                          fill,
                          payload,
                          percent,
                          value
                        } = props
                        const sin = Math.sin(-RADIAN * midAngle)
                        const cos = Math.cos(-RADIAN * midAngle)
                        const sx = cx + (outerRadius + 10) * cos
                        const sy = cy + (outerRadius + 10) * sin
                        const mx = cx + (outerRadius + 30) * cos
                        const my = cy + (outerRadius + 30) * sin
                        const ex = mx + (cos >= 0 ? 1 : -1) * 22
                        const ey = my
                        const textAnchor = cos >= 0 ? "start" : "end"

                        return (
                          <g>
                            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                              {payload.name}
                            </text>
                            <Sector
                              cx={cx}
                              cy={cy}
                              innerRadius={innerRadius}
                              outerRadius={outerRadius}
                              startAngle={startAngle}
                              endAngle={endAngle}
                              fill={fill}
                            />
                            <Sector
                              cx={cx}
                              cy={cy}
                              startAngle={startAngle}
                              endAngle={endAngle}
                              innerRadius={outerRadius + 6}
                              outerRadius={outerRadius + 10}
                              fill={fill}
                            />
                            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                            <text
                              x={ex + (cos >= 0 ? 1 : -1) * 12}
                              y={ey}
                              textAnchor={textAnchor}
                              fill="#333"
                            >
                              {`${value} problems`}
                            </text>
                            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                              {`(${(percent * 100).toFixed(2)}%)`}
                            </text>
                          </g>
                        )
                      }}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Completion Progress Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Completion Progress</CardTitle>
              <CardDescription>Solved vs. Total by difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        return [value, name === "Solved" ? "Solved Problems" : "Remaining Problems"]
                      }}
                    />
                    <Legend />
                    <Bar dataKey="solved" stackId="a" fill="#4ade80" name="Solved" />
                    <Bar dataKey="remaining" stackId="a" fill="#b6bbc4" name="Remaining" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress by Difficulty */}
        <h2 className="text-xl font-semibold mb-4">Progress by Difficulty</h2>
        <div className="grid grid-cols-1 gap-4 mb-8">
          {data.noAchivedInformationList.slice(0, 3).map((item) => (
            <Card key={item.name} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${item.name === "EASY" ? "bg-green-500" : item.name === "MEDIUM" ? "bg-yellow-500" : "bg-red-500"
                      }`}
                    >

                    </span>
                    <h3 className="font-medium">{item.name.charAt(0) + item.name.slice(1).toLowerCase()}</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.noAchived} / {item.noTotal}
                  </span>
                </div>
                <Progress
                  value={(item.noAchived / item.noTotal) * 100}
                  className={`h-2 ${item.name === "EASY" ? "bg-green-100" : item.name === "MEDIUM" ? "bg-yellow-100" : "bg-red-100"
                  }`}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {((item.noAchived / item.noTotal) * 100).toFixed(1)}% completed
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Problems */}
        <Tabs defaultValue="popular" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Problem Rankings</h2>
            <TabsList>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="flop">Least Attempted</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="popular" className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Problem</th>
                      <th className="text-right p-3 font-medium">Submissions</th>
                      <th className="text-right p-3 font-medium">Acceptance</th>
                      <th className="text-right p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPopularProblems.map((problem, index) => (
                      <tr key={problem.link} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{problem.title}</div>
                        </td>
                        <td className="p-3 text-right">{problem.totalSubmissions}</td>
                        <td className="p-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${problem.avgAcceptanceRate >= 70
                              ? "bg-green-100 text-green-800"
                              : problem.avgAcceptanceRate >= 40
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {problem.avgAcceptanceRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={`/problem/${problem.link}`}
                            target="_blank"
                            className="inline-flex items-center text-sm font-medium text-primary"
                          >
                            <SquareArrowOutUpRight className="ml-1 h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flop" className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Problem</th>
                      <th className="text-right p-3 font-medium">Submissions</th>
                      <th className="text-right p-3 font-medium">Acceptance</th>
                      <th className="text-right p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topFlopProblems.map((problem, index) => (
                      <tr key={problem.link} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{problem.title}</div>
                        </td>
                        <td className="p-3 text-right">{problem.totalSubmissions}</td>
                        <td className="p-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${problem.avgAcceptanceRate >= 70
                              ? "bg-green-100 text-green-800"
                              : problem.avgAcceptanceRate >= 40
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {problem.avgAcceptanceRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={`/problem/${problem.link}`}
                            target="_blank"
                            className="inline-flex items-center text-sm font-medium text-primary"
                          >
                            <SquareArrowOutUpRight className="ml-1 h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </>
    )
  }

  // Render the courses view
  const renderCoursesView = (data) => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalCourseCount}</div>
              <p className="text-xs text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalEnrollments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.avgRating.toFixed(1)}</div>
              <div className="mt-1">{renderStarRating(data.avgRating)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Rankings */}
        <Tabs defaultValue="popular" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Course Rankings</h2>
            <TabsList>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="flop">Least Popular</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="popular" className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Course</th>
                      <th className="text-right p-3 font-medium">Enrollments</th>
                      <th className="text-center p-3 font-medium">Rating</th>
                      <th className="text-right p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPopularCourses.map((course) => (
                      <tr key={course.id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{course.title}</div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-medium">{course.totalEnrollments.toLocaleString()}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center">{renderStarRating(course.avgRating)}</div>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={`/course/${course.id}`}
                            target="_blank"
                            className="inline-flex items-center text-sm font-medium text-primary"
                          >
                            View <SquareArrowOutUpRight className="ml-1 h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flop" className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Course</th>
                      <th className="text-right p-3 font-medium">Enrollments</th>
                      <th className="text-center p-3 font-medium">Rating</th>
                      <th className="text-right p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topFlopCourses.map((course) => (
                      <tr key={course.id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{course.title}</div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-medium">{course.totalEnrollments.toLocaleString()}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center">{renderStarRating(course.avgRating)}</div>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={`/course/${course.id}`}
                            target="_blank"
                            className="inline-flex items-center text-sm font-medium text-primary"
                          >
                            View <SquareArrowOutUpRight className="ml-1 h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enrollment Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Enrollment Summary</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Top 5 Popular Courses</span>
                    <span className="text-sm text-muted-foreground">
                      {data.topPopularCourses
                        .reduce((sum, course) => sum + course.totalEnrollments, 0)
                        .toLocaleString()}{" "}
                      enrollments
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(data.topPopularCourses.reduce((sum, course) => sum + course.totalEnrollments, 0) / data.totalEnrollments) * 100}%`
                      }}
                    >
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(
                      (data.topPopularCourses.reduce((sum, course) => sum + course.totalEnrollments, 0) /
                        data.totalEnrollments) *
                      100
                    ).toFixed(1)}
                    % of total enrollments
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Other 5 Courses</span>
                    <span className="text-sm text-muted-foreground">
                      {data.topFlopCourses.reduce((sum, course) => sum + course.totalEnrollments, 0).toLocaleString()}{" "}
                      enrollments
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-muted-foreground"
                      style={{
                        width: `${(data.topFlopCourses.reduce((sum, course) => sum + course.totalEnrollments, 0) / data.totalEnrollments) * 100}%`
                      }}
                    >
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(
                      (data.topFlopCourses.reduce((sum, course) => sum + course.totalEnrollments, 0) /
                        data.totalEnrollments) *
                      100
                    ).toFixed(1)}
                    % of total enrollments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">
        {type === "challenges" ? "Problem Overview" : "Learning Course Overview"}
      </h1>

      {/* Render the appropriate view based on data type */}
      {type === "challenges" && isChallengeData(data)
        ? renderChallengesView(data)
        : isCourseData(data) && renderCoursesView(data)}
    </div>
  )
}

