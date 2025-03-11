export function JavaFormatter(monaco) {
  monaco.languages.registerDocumentFormattingEditProvider("java", {
    provideDocumentFormattingEdits(model) {
      const text = model.getValue()
      const formatted = formatJavaCode(text)

      return [
        {
          range: model.getFullModelRange(),
          text: formatted
        }
      ]
    }
  })
}

function formatJavaCode(code) {
  const lines = code.split("\n")
  const formattedLines = []
  const state = {
    indentLevel: 0,
    inComment: false,
    inString: false,
    lastNonEmptyLine: ""
  }

  const INDENT_SIZE = 2
  const INDENT = " ".repeat(INDENT_SIZE)

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()

    // if (line === "") {
    //   continue
    // }

    if (line.startsWith("/*")) {
      state.inComment = true
    }
    if (line.endsWith("*/")) {
      state.inComment = false
    }

    if (line.startsWith("}") || line.startsWith(")")) {
      state.indentLevel = Math.max(0, state.indentLevel - 1)
    }

    if (line.length > 100 && !state.inComment && !state.inString) {
      line = wrapLongLine(line, INDENT.repeat(state.indentLevel + 1))
    }

    line = formatLine(line, state)

    formattedLines.push(INDENT.repeat(state.indentLevel) + line)

    if (line.endsWith("{")) {
      state.indentLevel++
    }

    if (line !== "") {
      state.lastNonEmptyLine = line
    }
  }

  return formattedLines.join("\n")
}

function preserveStrings(line) {
  const strings = []
  let inString = false
  let currentString = ""
  let processedLine = ""

  for (let i = 0; i < line.length; i++) {
    if (line[i] === "\"" && (i === 0 || line[i - 1] !== "\\")) {
      if (inString) {
        strings.push(currentString + "\"")
        processedLine += `__STRING${strings.length - 1}__`
        currentString = ""
      } else {
        currentString = "\""
      }
      inString = !inString
      continue
    }

    if (inString) {
      currentString += line[i]
    } else {
      processedLine += line[i]
    }
  }

  return { processedLine, strings }
}

function formatLine(line, state) {
  const { processedLine, strings } = preserveStrings(line)
  let formattedLine = processedLine

  // Format spacce for operators [==, ++, --, +=, -=]
  formattedLine = formattedLine.replace(/\s*=\s*=\s*/g, " == ")
  formattedLine = formattedLine.replace(/\s*\+\s*\+\s*/g, "++")
  formattedLine = formattedLine.replace(/\s*-\s*-\s*/g, "--")
  formattedLine = formattedLine.replace(/\s*\+\s*=\s*/g, " += ")
  formattedLine = formattedLine.replace(/\s*-\s*=\s*/g, " -= ")

  // Add space before open bracket
  formattedLine = formattedLine.replace(/([^\s])\{/g, "$1 {")

  // Remove multiple spaces (not in strings)
  formattedLine = formattedLine.replace(/\s+/g, " ")

  // Space after commas
  formattedLine = formattedLine.replace(/,([^\s])/g, ", $1")

  // Space after semicolons in for loops
  formattedLine = formattedLine.replace(/;([^\s])/g, "; $1")

  // No space before semicolon
  formattedLine = formattedLine.replace(/\s+;/g, ";")

  // Space after keywords
  const keywords = ["if", "else", "for", "while", "catch", "synchronized"]
  keywords.forEach((keyword) => {
    const regex = new RegExp(`${keyword}\\(`, "g")
    formattedLine = formattedLine.replace(regex, `${keyword} (`)
  })

  // No space before parentheses in method calls
  formattedLine = formattedLine.replace(/(\w+)\s+\(/, "$1(")

  // Space before opening brace
  formattedLine = formattedLine.replace(/\S{/, " {")

  // Restore strings
  strings.forEach((str, i) => {
    formattedLine = formattedLine.replace(`__STRING${i}__`, str)
  })

  return formattedLine
}

function wrapLongLine(line, indent) {
  const maxLength = 100

  if (line.length <= maxLength) return line

  const breakPoints = [
    line.lastIndexOf(" && ", maxLength),
    line.lastIndexOf(" || ", maxLength),
    line.lastIndexOf(", ", maxLength),
    line.lastIndexOf(" + ", maxLength)
  ].filter((point) => point !== -1)

  if (breakPoints.length === 0) return line

  const breakPoint = Math.max(...breakPoints)
  return line.slice(0, breakPoint + 1) + "\n" + indent + line.slice(breakPoint + 1)
}

function formatAnnotation(line) {
  return line.replace(/@\w+\s+@/g, (match) => match.replace(" ", "\n"))
}

