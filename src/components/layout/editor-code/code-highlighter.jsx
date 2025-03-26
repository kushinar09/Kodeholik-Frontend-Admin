"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import "./css/prism-darcula.css"
// import "./css/prism-atom-dark.css"

export function CodeHighlighter({ code, language = "javascript", showLineNumbers = true, className }) {
  const [highlightedCode, setHighlightedCode] = useState("")

  useEffect(() => {
    // Dynamically import Prism to avoid SSR issues
    import("prismjs").then((Prism) => {
      // Import the core
      import("prismjs/components/prism-core")

      // Import language support based on the prop
      import(`prismjs/components/prism-${language}`)

      // Import additional plugins if needed
      if (showLineNumbers) {
        import("prismjs/plugins/line-numbers/prism-line-numbers")
      }

      // Highlight the code
      const highlighted = Prism.default.highlight(
        code,
        Prism.default.languages[language] || Prism.default.languages.javascript,
        language,
      )
      setHighlightedCode(highlighted)
    })
  }, [code, language, showLineNumbers])


  return (
    <div className={cn("relative overflow-hidden bg-primary", className)}>
      <pre className={cn("p-4 overflow-x-auto text-sm", showLineNumbers && "line-numbers")}>
        <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  )
}
