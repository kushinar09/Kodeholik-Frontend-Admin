"use client"

import { useState, useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import { EditorState } from "@codemirror/state"
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
  CodeSquare,
  Loader2
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import "./styles.css"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

// highlight.js
import hljs from "highlight.js"
import "highlight.js/styles/default.css"
import { getCookie, setCookie } from "@/lib/utils"
import { toast } from "sonner"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/provider/AuthProvider"
import RenderMarkdown from "./RenderMarkdown"

// Cache for storing image URLs
const imageUrlCache = new Map()

const MarkdownEditor = ({ value = "", onChange = null, cookieDraft = "" }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const fileInputRef = useRef(null)
  const cursorPositionRef = useRef(null)

  const { apiCall } = useAuth()

  const [markdownContent, setMarkdownContent] = useState(() => {
    const draft = getCookie(cookieDraft)
    return draft || typeof value === "string" ? value : ""
  })

  const editorViewRef = useRef(null)

  useEffect(() => {
    const draft = getCookie(cookieDraft)
    if (draft) {
      setMarkdownContent(draft)
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
      setMarkdownContent(typeof value === "string" ? value : "")
    }
  }, [])

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
        hljs.highlightElement(block)
    })
    if (onChange) onChange(markdownContent)
  }, [markdownContent])

  useEffect(() => {
    const saveInterval = setInterval(() => {
      setCookie(cookieDraft, markdownContent)
    }, 10000)

    return () => clearInterval(saveInterval)
  }, [markdownContent, cookieDraft])

  useEffect(() => {
    const state = EditorState.create({
      doc: markdownContent,
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
          "&": { height: "100%", width: "100%" },
          ".cm-scroller": { overflow: "auto", height: "100%" },
          ".cm-content": { fontFamily: "monospace", minHeight: "100%" },
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

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const shortcut = shortcuts[e.key.toLowerCase()]
        if (shortcut) {
          if (e.key.toLowerCase() !== "s") {
            e.preventDefault()
            applyMarkdown(shortcut.action)
          } else {
            e.preventDefault()
            const currentContent = editorViewRef.current.state.doc.toString()
            setCookie(cookieDraft, currentContent)
            toast.info({
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
      lines = text.split("\n")
      if (lines.length > 1) {
        const numberMatch = lines[0].match(/^\d+\.\s/)
        if (numberMatch) {
          newText = lines.map((line) => line.replace(/^\d+\.\s/, "")).join("\n")
        } else {
          newText = lines.map((line, index) => `${index + 1}. ${line}`).join("\n")
          if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
            newText = "\n" + newText
          }
        }
      } else {
        const numberMatch = text.match(/^\d+\.\s/)
        if (numberMatch) {
          newText = text.replace(/^\d+\.\s/, "")
        } else {
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
    case "![]()":
      if (from === to) {
        text = "Image description"
      }
      newText = `\n![${text}](url)\n`
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

  const handleImageClick = () => {
    if (editorViewRef.current) {
      cursorPositionRef.current = editorViewRef.current.state.selection.main.from
    }
    setIsImageDialogOpen(true)
  }

  const handleFileSelect = () => {
    if (editorViewRef.current) {
      cursorPositionRef.current = editorViewRef.current.state.selection.main.from
    }
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await apiCall(ENDPOINTS.POST_UPLOAD_IMAGE, {
        method: "POST",
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()

      if (!uploadData) {
        throw new Error("Key not found in upload response")
      }

      const imageKey = uploadData[0]
      const altText = file.name || "Image"

      if (editorViewRef.current && cursorPositionRef.current !== null) {
        const imageMarkdown = `\n![${altText}](s3:${imageKey})\n`

        const transaction = editorViewRef.current.state.update({
          changes: {
            from: cursorPositionRef.current,
            to: cursorPositionRef.current,
            insert: imageMarkdown
          },
          selection: { anchor: cursorPositionRef.current + imageMarkdown.length }
        })

        editorViewRef.current.dispatch(transaction)
        editorViewRef.current.focus()
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error("Error", {
        description: `Upload failed: ${error.message}`,
        duration: 3000
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const insertImageFromUrl = () => {
    if (!imageUrl.trim()) {
      toast.warning({
        description: "Please enter an image URL",
        duration: 3000
      })
      return
    }

    if (editorViewRef.current && cursorPositionRef.current !== null) {
      const alt = imageAlt.trim() || "Image"
      const imageMarkdown = `\n![${alt}](${imageUrl})\n`

      const transaction = editorViewRef.current.state.update({
        changes: {
          from: cursorPositionRef.current,
          to: cursorPositionRef.current,
          insert: imageMarkdown
        },
        selection: { anchor: cursorPositionRef.current + imageMarkdown.length }
      })

      editorViewRef.current.dispatch(transaction)
      editorViewRef.current.focus()
    }

    setImageUrl("")
    setImageAlt("")
    setIsImageDialogOpen(false)
  }

  return (
    <div className="flex flex-col bg-background h-full w-full">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>Add an image to your content</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="py-4">
              <div className="flex flex-col gap-4">
                <Button onClick={handleFileSelect} disabled={isUploading} className="w-full">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Image className="mr-2 h-4 w-4" />
                      Choose Image
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="py-4">
              <div className="flex flex-col gap-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="image-alt">Alt Text</Label>
                  <Input
                    id="image-alt"
                    placeholder="Image description"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                  />
                </div>
                <Button onClick={insertImageFromUrl}>Insert Image</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <div className="border-b bg-muted/40">
        <TooltipProvider>
          <div className="flex flex-wrap items-center gap-2 my-4 ms-4">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("#")}>
                    <Heading className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading: Ctrl + H</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("**")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold: Ctrl + B</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("*")}>
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
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("`")}>
                    <CodeSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Inline Code: Ctrl + `</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("```")}>
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
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("1.")}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ordered List: Ctrl + O</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("-")}>
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unordered List: Ctrl + L</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("---")}>
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
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown("[]()")}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Link: Ctrl + K</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" type="button" onClick={handleImageClick} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload Image</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" type="button" onClick={() => applyMarkdown(">")}>
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

      <div className="flex-1 grid grid-cols-2 divide-x min-h-0">
        <div id="editor" className="h-full w-full overflow-auto focus-within:ring-1 focus-within:ring-ring" />
        <div className="h-full overflow-auto">
          <RenderMarkdown content={markdownContent} className="p-4" />
        </div>
      </div>
    </div>
  )
}

export default MarkdownEditor

