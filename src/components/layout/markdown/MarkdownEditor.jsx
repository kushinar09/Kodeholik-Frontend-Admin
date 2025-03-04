"use client"

import React, { useState, useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import { EditorState } from "@codemirror/state"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  LinkIcon,
  Quote,
  ListOrdered,
  List,
  Minus,
  Heading,
  Image,
  Code2Icon,
  CodeSquare
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import "./styles.css"
import { Separator } from "@/components/ui/separator"
import { marked } from "marked"

//highlight.js
import hljs from "highlight.js"
import "highlight.js/styles/default.css"

//save cookie
import { setCookie, getCookie } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "sonner"

const MarkdownEditor = ({ value, onChange, cookieDraft }) => {
  const { toast } = useToast()
  marked.use({
    // ALLOWS LINE BREAKS WITH RETURN BUTTON
    breaks: true,
    useNewRenderer: true,
    renderer: {
      // INSERTS target="_blank" INTO HREF TAG
      link({ href, text, title }) {
        return `<a target="_blank" href="${href}"${title ? ` title="${title}"` : ""} rel="noopener noreferrer nofollow ugc">${text}</a>`
      }
    }
  })

  // INITIAL MARKDOWN CONTENT
  const [markdownContent, setMarkdownContent] = useState(() => {
    const draft = getCookie(cookieDraft)
    return draft || typeof(value) === "string" ? value : ""
  })
  //const [isSaving, setIsSaving] = useState(false)
  const editorViewRef = useRef(null)

  // Load draft on mount
  useEffect(() => {
    const draft = getCookie(cookieDraft)
    if (draft) {
      setMarkdownContent(draft)
      // Update the editor content
      if (editorViewRef.current) {
        const transaction = editorViewRef.current.state.update({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: draft
          }
        })
        editorViewRef.current.dispatch(transaction)
      }
    } else {
      setMarkdownContent(typeof(value) === "string" ? value : "")
    }
  }, [])

  // Define keyboard shortcuts
  const shortcuts = {
    b: { key: "B", action: "**", label: "Bold" },
    i: { key: "I", action: "*", label: "Italic" },
    k: { key: "K", action: "[]()", label: "Link" },
    "`": { key: "`", action: "`", label: "Inline Code" },
    h: { key: "H", action: "#", label: "Heading" },
    l: { key: "L", action: "-", label: "List" },
    o: { key: "O", action: "1.", label: "Ordered List" },
    q: { key: "Q", action: ">", label: "Quote" },
    s: { key: "S", action: "save", label: "Save" }
  }

  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      if (!(block.hasAttribute("data-highlighted") && block.getAttribute("data-highlighted") == "yes"))
        hljs.highlightBlock(block)
    })
    onChange(markdownContent)
  }, [markdownContent])

  // Save draft to cookie every 10s
  useEffect(() => {
    setTimeout(() => {
      setCookie("draft", markdownContent)
    }, 10000)
  })

  useEffect(() => {
    const state = EditorState.create({
      doc: markdownContent,
      linesNumber: false,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        markdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setMarkdownContent(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-content": { fontFamily: "monospace" },
          ".cm-cursor, .cm-dropCursor": {
            borderLeftColor: "#000000",
            borderLeftWidth: "2px",
            borderLeftStyle: "solid"
          },
          ".cm-gutters": { display: "none" }
        })
      ]
    })

    editorViewRef.current = new EditorView({
      state,
      parent: document.getElementById("editor")
    })

    // Add keyboard event listener
    const handleKeyDown = (e) => {
      // Check if Ctrl/Cmd key is pressed
      if (e.ctrlKey || e.metaKey) {
        if (shortcuts[e.key.toLowerCase()]) {
          if (e.key.toLowerCase() !== "s") {
            e.preventDefault()
            applyMarkdown(shortcuts[e.key.toLowerCase()].action)
          } else {
            e.preventDefault()
            const currentContent = editorViewRef.current.state.doc.toString()
            setCookie("draft", currentContent)
            toast({
              description: "Saved.",
              duration: 1000
            })
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
      }
      document.removeEventListener("keydown", handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyMarkdown = (syntax) => {
    if (!editorViewRef.current) return

    const view = editorViewRef.current
    const state = view.state
    const selection = state.selection.main

    const from = selection.from
    const to = selection.to
    let text = state.doc.sliceString(from, to)

    let newText = ""
    let linkRegex
    let lines
    switch (syntax) {
    case "**":
      if (from === to) {
        text = "Bold"
      }
      if (text.startsWith("**") && text.endsWith("**")) {
        newText = text.slice(2, -2)
      } else if (/^#+\s/.test(text)) {
        let pre
        let heading = text.replace(/^#+\s/, (match) => {
          pre = match
          return ""
        })
        if (heading.startsWith("**") && heading.endsWith("**")) {
          heading = heading.slice(2, -2)
          newText = pre + heading
        } else {
          newText = pre + `**${heading}**`
        }
      } else {
        newText = `**${text}**`
      }
      break
    case "#":
      if (from === to) {
        text = "Heading"
      }
      if (text.startsWith("#")) {
        newText = `#${text}`
      } else {
        newText = `# ${text}`
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
      }
      break
    case "*":
      if (from === to) {
        text = "Italic"
      }
      if (text.startsWith("*") && text.endsWith("*")) {
        newText = text.slice(1, -1)
      } else {
        newText = `*${text}*`
      }
      break
    case "`":
      if (from === to) {
        text = "code"
      }
      if (text.startsWith("`") && text.endsWith("`")) {
        newText = text.slice(1, -1)
      } else {
        newText = `\`${text}\``
      }
      break
    case "```":
      if (from === to) {
        text = "public static void main(String[] args) {\n  System.out.println(\"Hello, World!\");\n}"
      }
      if (text.startsWith("```\n") && text.endsWith("\n```")) {
        newText = text.slice(4, -4)
      } else {
        newText = `\`\`\`\n${text}\n\`\`\``
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
        newText = newText + "\n"
      }
      break
    case "[]()":
      if (from === to) {
        text = "link"
      }
      linkRegex = /^\[(.+)\]$$(.+)$$$/
      if (linkRegex.test(text)) {
        newText = text.match(linkRegex)[1]
      } else {
        newText = `[${text}](url)`
      }
      break
    case ">":
      if (from === to) {
        text = "Quote"
      }
      if (text.startsWith("> ")) {
        newText = text.slice(2)
      } else {
        newText = `> ${text}`
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
      }
      break
    case "1.":
      // Check if text has multiple lines
      lines = text.split("\n")
      if (lines.length > 1) {
        // Check if first line starts with any number followed by dot and space
        const numberMatch = lines[0].match(/^\d+\.\s/)
        if (numberMatch) {
          // Remove the numbering from all lines
          newText = lines.map((line) => line.replace(/^\d+\.\s/, "")).join("\n")
        } else {
          // Add incrementing numbers to each line
          newText = lines.map((line, index) => `${index + 1}. ${line}`).join("\n")
          if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
            newText = "\n" + newText
          }
        }
      } else {
        // Single line case
        const numberMatch = text.match(/^\d+\.\s/)
        if (numberMatch) {
          // Remove the numbering
          newText = text.replace(/^\d+\.\s/, "")
        } else {
          // Add numbering
          newText = `1. ${text}`
          if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
            newText = "\n" + newText
          }
        }
      }
      break
    case "-":
      if (text.startsWith("- ")) {
        newText = text.slice(2)
      } else {
        newText = `- ${text}`
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
      }
      break
    case "---":
      newText = "\n---\n"
      break
    default:
      newText = text
    }

    const transaction = state.update({
      changes: {
        from,
        to,
        insert: newText
      },
      selection:
        selection.from === selection.to
          ? { anchor: from + newText.length }
          : { anchor: from, head: from + newText.length }
    })

    view.dispatch(transaction)
    view.focus()
  }

  return (
    <div className="flex flex-col bg-background h-fit">
      {/* Toolbar */}
      <div className="border-b bg-muted/40">
        <TooltipProvider>
          <div className="flex flex-wrap items-center gap-2 my-4 ms-4">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("#")}>
                    <Heading className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading: Ctrl + H</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("**")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold: Ctrl + B</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("*")}>
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic: Ctrl + I</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("`")}>
                    <CodeSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Inline Code: Ctrl + `</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("```")}>
                    <Code2Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Code Block</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("1.")}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ordered List: Ctrl + O</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("-")}>
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unordered List: Ctrl + L</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("---")}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Divider</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("[]()")}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Link: Ctrl + K</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("---")}>
                    <Image className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Image</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown(">")}>
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quote: Ctrl + Q</TooltipContent>
              </Tooltip>
            </div>
          </div>
          {/* {isSaving && (
            <div className="ml-auto mr-4 text-sm text-muted-foreground animate-fade-in">
              Saving...
            </div>
          )} */}
        </TooltipProvider>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 grid grid-cols-2 divide-x h-fit max-h-[500px]">
        <div id="editor" className="min-h-[500px] overflow-auto focus-within:ring-1 focus-within:ring-ring" />
        <div className="min-h-0 overflow-auto">
          <div
            className="markdown prose prose-sm dark:prose-invert max-w-none p-4"
            dangerouslySetInnerHTML={{ __html: marked(markdownContent) }}
          />
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default MarkdownEditor

