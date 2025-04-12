import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function LoadingScreen({ loadingText = "Loading..." }) {
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const fullText = "Kodeholik"
  const codeSymbols = "</>"

  const typingSpeed = 100
  const delayAfterTyping = 2000
  const delayBeforeDeleting = 1000

  useEffect(() => {
    let timeout

    if (!isDeleting && text.length < fullText.length) {
      // Typing
      timeout = setTimeout(() => {
        setText(fullText.slice(0, text.length + 1))
      }, typingSpeed)
    } else if (!isDeleting && text.length === fullText.length) {
      // Completed typing, wait before starting to delete
      timeout = setTimeout(() => {
        setIsDeleting(true)
      }, delayAfterTyping)
    } else if (isDeleting && text.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setText(text.slice(0, -1))
      }, typingSpeed)
    } else if (isDeleting && text.length === 0) {
      // Completed deleting, wait before starting to type again
      timeout = setTimeout(() => {
        setIsDeleting(false)
      }, delayBeforeDeleting)
    }

    return () => clearTimeout(timeout)
  }, [text, isDeleting])

  return (
    <div className="z-50 fixed inset-0 bg-primary/50 backdrop-blur-md flex items-center justify-center">
      <div className="relative">
        {/* Terminal window frame */}
        <motion.div
          className="w-[300px] h-[150px] bg-primary rounded-lg p-4 relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Terminal header */}
          <div className="flex gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>

          {/* Code symbols */}
          <motion.div
            className="text-white text-xl absolute top-6 right-4 -translate-y-1/2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            {codeSymbols}
          </motion.div>

          {/* Typing text */}
          <div className="flex flex-col gap-1 justify-center items-center h-[70px]">
            <motion.div
              className="text-white text-2xl relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {text || "\u00A0"}
              <motion.span
                className="absolute -right-[4px] top-1 w-[2px] h-[20px] bg-white"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY }}
              />
            </motion.div>

            {/* I want this div in new line not in same with previous div */}
            <div>
              {/* Loading text */}
              <motion.p
                className="text-center text-white"
                animate={{ opacity: [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{loadingText}</span>
                </div>
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Glitch effects */}
        <motion.div
          className="absolute inset-0 bg-emerald-500/20"
          animate={{
            opacity: [0, 0.1, 0],
            x: [-10, 10, -10],
            scaleX: [1, 1.02, 1]
          }}
          transition={{
            duration: 0.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse"
          }}
        />
      </div>
    </div>
  )
}