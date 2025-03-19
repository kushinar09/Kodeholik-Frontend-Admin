/**
 * Formats values for display in the UI
 * @param {any} value - Value to format
 * @returns {string} Formatted value as string
 */
export function formatValue(value) {
  if (typeof value === "number") {
    return value.toString()
  }

  if (typeof value === "string") {
    return `"${value}"`
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => formatValue(item)).join(", ")}]`
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false"
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2)
  }

  if (typeof value === "symbol" || typeof value === "undefined") {
    return String(value)
  }

  return value
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error("Failed to copy!", err)
    return false
  }
}
