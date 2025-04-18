"use client"

import { marked } from "marked"
import { useMemo } from "react"
import { ENDPOINTS } from "@/lib/constants"

const imageUrlCache = new Map()

export default function RenderMarkdown({ content, className = "" }) {

  const markdownContent = content || ""

  const renderMarkdown = (content) => {
    const customRenderer = new marked.Renderer()

    customRenderer.image = (href) => {
      const title = href.title || ""
      const text = href.text || ""

      if (href.href.startsWith("s3:")) {
        const key = href.href.substring(3)
        const placeholderSrc = "/placeholder.svg?height=200&width=300"

        // Generate a unique ID for this image
        const uniqueId = `img-${key.replace(/[^a-zA-Z0-9]/g, "")}`

        // Check if we already have the URL in cache
        if (!imageUrlCache.has(key)) {
          // If not in cache, set up lazy loading
          imageUrlCache.set(key, null) // Set a null placeholder

          // Use requestAnimationFrame to defer the fetch until after rendering
          requestAnimationFrame(() => {
            if (!document.getElementById(uniqueId)) return // If the image is no longer in the DOM, don't fetch

            fetch(ENDPOINTS.GET_IMAGE.replace(":key", encodeURIComponent(key)))
              .then((response) => response.text())
              .then((imageUrl) => {
                imageUrlCache.set(key, imageUrl)
                const imgElement = document.getElementById(uniqueId)
                if (imgElement) {
                  imgElement.src = imageUrl
                }
              })
              .catch((error) => {
                console.error("Error fetching image URL:", error)
                imageUrlCache.delete(key) // Remove from cache on error
              })
          })
        }

        const cachedUrl = imageUrlCache.get(key)
        const initialSrc = cachedUrl || placeholderSrc

        return `<img loading="lazy" 
          id="${uniqueId}"
          src="${initialSrc}" 
          alt="${text}" 
          title="${title || ""}" 
          data-s3-key="${key}"
          onerror="this.onerror=null; this.src='${placeholderSrc}'; this.alt='Image failed to load';"
        />`
      }

      return `<img loading="lazy" src="${href.href}" alt="${text}" title="${title || ""}" />`
    }

    marked.use({ renderer: customRenderer })

    return marked(content)
  }

  // Memoize the rendered markdown
  const renderedMarkdown = useMemo(() => renderMarkdown(markdownContent), [markdownContent])

  return (
    <>
      <div>
        <div
          className={`markdown prose prose-sm dark:prose-invert max-w-none ${className}`}
          dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
        />
      </div>
    </>
  )
}

