import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import guide1 from "@/assets/images/guide-testcase/guide-1.png"
import guide2 from "@/assets/images/guide-testcase/guide-2.png"

export default function ExcelUploadGuidePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Test Case Upload Guide</h1>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p>
            This guide explains how to format and upload your test cases using Excel files. Following the correct format
            ensures your test cases are properly processed by our system.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Excel File Format</h2>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Your Excel file must follow the exact format described below to be processed correctly.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-xl font-medium">Sheet Naming</h3>
            <p>
              Create separate sheets for each programming language using the format: <code>{"{language}TestCase"}</code>
            </p>
            <div className="rounded-md border overflow-hidden">
              <img loading="lazy"
                src={guide1}
                alt="Example of sheet naming showing JavaTestCase and CTestCase tabs"
                width={400}
                height={50}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Example: JavaTestCase for Java, CTestCase for C, PythonTestCase for Python, etc.
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-medium">Column Structure</h3>
            <p>Each sheet must have the following columns:</p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">param1, param2, ...</TableCell>
                  <TableCell>Replace with your actual parameter names (e.g., &quot;number1&quot;, &quot;inputString&quot;)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Expected Output</TableCell>
                  <TableCell>The expected result for the given parameters</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Is Sample</TableCell>
                  <TableCell>Set to TRUE for public test cases, FALSE for private test cases</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="rounded-md border overflow-hidden">
              <img loading="lazy"
                src={guide2}
                alt="Example of Excel structure with param1, param2, Expected Output, and Is Sample columns"
                width={650}
                height={150}
                className="w-full"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Example Test Cases</h2>

          <Tabs defaultValue="simple">
            <TabsList>
              <TabsTrigger value="simple">Simple Example</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Example</TabsTrigger>
            </TabsList>
            <TabsContent value="simple" className="space-y-4">
              <h3 className="text-xl font-medium">Addition Function Test Cases</h3>
              <p>For a function that adds two numbers:</p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>number1</TableHead>
                    <TableHead>number2</TableHead>
                    <TableHead>Expected Output</TableHead>
                    <TableHead>Is Sample</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>3</TableCell>
                    <TableCell>TRUE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>115</TableCell>
                    <TableCell>200</TableCell>
                    <TableCell>315</TableCell>
                    <TableCell>TRUE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>-5</TableCell>
                    <TableCell>10</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>FALSE</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4">
              <h3 className="text-xl font-medium">String Manipulation Test Cases</h3>
              <p>For a function that concatenates a string with its reverse:</p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>inputString</TableHead>
                    <TableHead>Expected Output</TableHead>
                    <TableHead>Is Sample</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>&quot;hello&quot;</TableCell>
                    <TableCell>&quot;helloolleh&quot;</TableCell>
                    <TableCell>TRUE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>&quot;abc&quot;</TableCell>
                    <TableCell>&quot;abccba&quot;</TableCell>
                    <TableCell>TRUE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>&quot;test123&quot;</TableCell>
                    <TableCell>&quot;test123321tset&quot;</TableCell>
                    <TableCell>FALSE</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Upload Instructions</h2>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Steps to Upload</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Prepare your Excel file according to the format described above</li>
              <li>Click the &quot;Select File&quot; button and select your Excel file</li>
            </ol>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Important Notes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Each sheet in your Excel file must correspond to a specific programming language</li>
            <li>Parameter names should match the function parameters in your code</li>
            <li>Test cases marked as &quot;Is Sample = TRUE&quot; will be visible to users</li>
            <li>Test cases marked as &quot;Is Sample = FALSE&quot; will be used for evaluation but won&apos;t be visible</li>
            <li>The system supports multiple parameters (param1, param2, param3, etc.)</li>
            <li>Ensure your &quot;Expected Output&quot; values match the exact format your function returns</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

