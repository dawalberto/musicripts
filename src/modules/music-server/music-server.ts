import { ErrorTypes } from "@/types.js"
import { exec } from "child_process"
import { promisify } from "util"
import { logger } from "../index.js"
const execPromise = promisify(exec)

export class MusicServer {
  constructor() {}

  public async scanLibrary(): Promise<void> {
    try {
      logger.start("📡 Scanning music library...")
      await execPromise(`docker exec navidrome /app/navidrome scan`)
      logger.succeed()
    } catch (error: any) {
      logger.fail(ErrorTypes.SCAN_LIBRARY, "scanLibrary()", error.stderr || error.message || error)
    }
  }
}
