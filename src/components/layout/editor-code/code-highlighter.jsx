"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Prism from "prismjs"
import "prismjs/components/prism-core"
import "prismjs/components/prism-javascript"
import "prismjs/plugins/line-numbers/prism-line-numbers"
import "./css/prism-darcula.css"
// import "./css/prism-atom-dark.css"

export function CodeHighlighter({ code, language = "javascript", showLineNumbers = true, className }) {
  const [highlightedCode, setHighlightedCode] = useState("")

  useEffect(() => {
    // Highlight the code
    const highlighted = Prism.highlight(
      code,
      Prism.languages[language] || Prism.languages.javascript,
      language,
    )
    setHighlightedCode(highlighted)
  }, [code, language])

  return (
    <div className={cn("relative overflow-hidden bg-primary", className)}>
      <pre className={cn("p-4 overflow-x-auto text-sm", showLineNumbers && "line-numbers")}>
        <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  )
}
