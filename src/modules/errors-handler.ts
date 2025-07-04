import { ErrorType } from "./types";

export function logError(type: ErrorType, details: string) {
  return `\n    \x1b[1mType:\x1b[0m ${type}\n    \x1b[1mDetails:\x1b[0m ${details}\n`;
}
