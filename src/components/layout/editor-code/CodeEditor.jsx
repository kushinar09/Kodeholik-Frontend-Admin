"use client"

import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor"
import { INITIAL_CODE_DEFAULT } from "./constants"
import { editorConfig } from "./editor-config"
import { JavaCompletionProvider } from "./completion-provider"
import { JavaDiagnosticsProvider } from "./diagnostics-provider"
import { JavaFormatter } from "./format-config"

let isCompletionProviderRegistered = false

export default function CodeEditor({ initialCode, onChange, className = "" }) {
  const editorRef = useRef(null)
  const [editor, setEditor] = useState(null)
  const [breakpoints, setBreakpoints] = useState(new Map()) // Track breakpoints

  useEffect(() => {
    if (!initialCode || initialCode === "") {
      onChange(INITIAL_CODE_DEFAULT)
    }

    if (editorRef.current && !editor) {
      monaco.languages.register({ id: "java" })

      const editorInstance = monaco.editor.create(editorRef.current, {
        ...editorConfig,
        value: initialCode || INITIAL_CODE_DEFAULT,
        glyphMargin: true
      })

      if (!isCompletionProviderRegistered) {
        JavaCompletionProvider(monaco)
        isCompletionProviderRegistered = true
      }
      JavaDiagnosticsProvider(monaco)
      JavaFormatter(monaco)

      editorInstance.onDidChangeModelContent(() => {
        const updatedCode = editorInstance.getValue()
        if (onChange) {
          onChange(updatedCode)
        }
      })

      editorInstance.onMouseDown((e) => {
        if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
          const lineNumber = e.target.position.lineNumber
          toggleBreakpoint(editorInstance, lineNumber)
        }
      })

      setEditor(editorInstance)

      return () => {
        editorInstance.getModel()?.dispose()
        editorInstance.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleBreakpoint = (editor, lineNumber) => {
    setBreakpoints((prev) => {
      const updatedBreakpoints = new Map(prev)

      if (updatedBreakpoints.has(lineNumber)) {
        const decorationId = updatedBreakpoints.get(lineNumber)
        editor.deltaDecorations([decorationId], [])
        updatedBreakpoints.delete(lineNumber)
      } else {
        const newDecorations = editor.deltaDecorations([], [
          {
            range: new monaco.Range(lineNumber, 1, lineNumber, 1),
            options: {
              glyphMarginClassName: "breakpoint-icon"
            }
          }
        ])
        updatedBreakpoints.set(lineNumber, newDecorations[0])
      }

      return new Map(updatedBreakpoints)
    })
  }

  return (
    <div className="w-full h-full">
      <div ref={editorRef} className={`w-full h-full ${className}`} />
      <style>
        {`
          .breakpoint-icon::after {
            border-radius: 100%;
            content: "";
            cursor: pointer;
            display: block;
            margin-left: 4px;
            height: 10px;
            width: 10px;
            background-color: rgb(226, 74, 66);
          }
        `}
      </style>
    </div>
  )
}
