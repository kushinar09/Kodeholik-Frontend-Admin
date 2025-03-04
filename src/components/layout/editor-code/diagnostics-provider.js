export function JavaDiagnosticsProvider(monaco) {
  // Register a model change listener for Java language
  monaco.editor.onDidCreateModel((model) => {
    if (model.getLanguageId() === "java") {
      const checkDiagnostics = () => {
        const text = model.getValue()
        const diagnostics = []

        // // Check for basic syntax errors
        // if (!text.includes("class")) {
        //   diagnostics.push({
        //     severity: monaco.MarkerSeverity.Error,
        //     message: "No class definition found",
        //     startLineNumber: 1,
        //     startColumn: 1,
        //     endLineNumber: 1,
        //     endColumn: 1
        //   })
        // }

        // if (text.includes("public class") && !text.includes("public static void main")) {
        //   diagnostics.push({
        //     severity: monaco.MarkerSeverity.Error,
        //     message: "No main method found",
        //     startLineNumber: 1,
        //     startColumn: 1,
        //     endLineNumber: 1,
        //     endColumn: 1
        //   })
        // }

        // Check for unmatched braces
        const openBraces = (text.match(/\{/g) || []).length
        const closeBraces = (text.match(/\}/g) || []).length
        if (openBraces !== closeBraces) {
          diagnostics.push({
            severity: monaco.MarkerSeverity.Error,
            message: "Unmatched braces: '{'",
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
          })
        }

        // Check for missing parentheses
        const parenthesisOpen = (text.match(/\(/g) || []).length
        const parenthesisClose = (text.match(/\)/g) || []).length
        if (parenthesisOpen !== parenthesisClose) {
          diagnostics.push({
            severity: monaco.MarkerSeverity.Error,
            message: "Unmatched parentheses: '('",
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: 1,
            endColumn: 1
          })
        }

        // Check for missing semicolons at the end of statements
        const lines = text.split("\n")
        lines.forEach((line, index) => {
          const trimmed = line.trim()
          if (
            trimmed &&
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.startsWith("//") &&
            !trimmed.includes("class") &&
            !trimmed.includes("if") &&
            !trimmed.includes("else") &&
            !trimmed.includes("for") &&
            !trimmed.includes("while") &&
            !trimmed.includes("try") &&
            !trimmed.includes("catch")
          ) {
            diagnostics.push({
              severity: monaco.MarkerSeverity.Warning,
              message: "Missing semicolon at the end of the statement",
              startLineNumber: index + 1,
              startColumn: 1,
              endLineNumber: index + 1,
              endColumn: line.length + 1
            })
          }
        })

        // // Check for mistyped main method
        // const mainMethodRegex = /public\s+static\s+void\s+main\s*\(String\[\]\s+args\)/
        // if (!mainMethodRegex.test(text)) {
        //   diagnostics.push({
        //     severity: monaco.MarkerSeverity.Error,
        //     message: "Mistyped main method. Should be: public static void main(String[] args)",
        //     startLineNumber: 1,
        //     startColumn: 1,
        //     endLineNumber: 1,
        //     endColumn: 1
        //   })
        // }

        // Set the markers on the model
        monaco.editor.setModelMarkers(model, "java", diagnostics)
      }

      // Check diagnostics initially
      checkDiagnostics()

      // Re-check diagnostics on content change
      model.onDidChangeContent(() => checkDiagnostics())
    }
  })
}
