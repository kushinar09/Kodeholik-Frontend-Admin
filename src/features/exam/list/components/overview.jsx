"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Replace the beginning of the component with this code to handle undefined data
export default function GradeOverview({ data }) {
  // Handle case when data is undefined or missing properties
  if (!data) {
    return <div className="p-4 pl-0">No data available</div>
  }

  // Provide default values for missing data
  const {
    avgGrade = "0.00",
    submittedPercent = "0%",
    excellentGradePercent = "0%",
    goodGradePercent = "0%",
    badGradePercent = "0%",
    gradeDistribution = [],
    avgProblemPoints = []
  } = data

  // Format and sort grade distribution data for the chart
  const gradeDistributionData = gradeDistribution
    .map(([grade, percentage]) => ({
      grade: typeof grade === "number" ? grade.toFixed(1) : "0.0",
      percentage: typeof percentage === "string" ? Number.parseFloat(percentage.replace("%", "")) : 0
    }))
    .sort((a, b) => parseFloat(a.grade) - parseFloat(b.grade))


  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Grade</CardDescription>
            <CardTitle className="text-4xl">{avgGrade}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Submission Rate</CardDescription>
            <CardTitle className="text-4xl">{submittedPercent}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-green-100 dark:bg-green-950">
          <CardHeader className="pb-2">
            <CardDescription>Excellent Grades (≥ 8)</CardDescription>
            <CardTitle className="text-4xl text-green-600 dark:text-green-400">{excellentGradePercent}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-yellow-100 dark:bg-yellow-950">
          <CardHeader className="pb-2">
            <CardDescription>Good Grades (6-8)</CardDescription>
            <CardTitle className="text-4xl text-yellow-600 dark:text-yellow-400">{goodGradePercent}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-red-100 dark:bg-red-950">
          <CardHeader className="pb-2">
            <CardDescription>Poor Grades (&lt; 6)</CardDescription>
            <CardTitle className="text-4xl text-red-600 dark:text-red-400">{badGradePercent}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Grade Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Percentage of students by grade</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[420px] w-full"
            config={{
              percentage: {
                label: "Phần trăm học sinh",
                color: "hsl(var(--primary))"
              }
            }}
          >
            <BarChart data={gradeDistributionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="grade" label={{ value: "Grade", position: "insideBottom", offset: -5 }} />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                label={{ value: "Student Percentage", angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Grade</span>
                            <span className="font-bold text-foreground">{payload[0].payload.grade}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Student Percentage</span>
                            <span className="font-bold text-foreground">{payload[0].value}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="percentage"
                fill="var(--color-percentage)"
                radius={[4, 4, 0, 0]}
                name="Student Percentage"
                isAnimationActive={true}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Problem Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Average Points by Problem</CardTitle>
          <CardDescription>Problem solving performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Average Points</TableHead>
                <TableHead>Max Points</TableHead>
                <TableHead>Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {avgProblemPoints.map(([title, avgPoints, maxPoints], index) => {
                const completionRate = (Number.parseFloat(avgPoints) / Number.parseFloat(maxPoints)) * 100

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{title}</TableCell>
                    <TableCell>{avgPoints}</TableCell>
                    <TableCell>{maxPoints}</TableCell>
                    <TableCell className="w-[30%]">
                      <div className="flex items-center gap-2">
                        <Progress value={completionRate} className="h-2" />
                        <span className="text-sm text-muted-foreground">{completionRate.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

