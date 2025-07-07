import { ErrorType } from "./types"

export function getLogErrorMessage(type: ErrorType, details: string) {
  return `\n    \x1b[1mType:\x1b[0m ${type}\n    \x1b[1mDetails:\x1b[0m ${details}\n`
}

export function logSuccessMessage(message: string) {
  return console.log(`\x1b[1m✅ SUCCESS:\x1b[0m ${message}`)
}

export function logMessage(message: string) {
  return console.log(`\x1b[1mℹ️  MESSAGE:\x1b[0m ${message}`)
}
