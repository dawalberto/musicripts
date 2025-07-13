import { exec } from "child_process"
import { promisify } from "util"
import { ErrorTypes } from "../types/errors"
import logger from "./logger"
const execPromise = promisify(exec)

class MusicServer {
  constructor() {}

  public async rescanLibrary(): Promise<void> {
    try {
      logger.start("Rescanning music library...")
      await execPromise(`docker exec navidrome /app/navidrome scan`)
      logger.succeed()
    } catch (error: any) {
      logger.fail(
        ErrorTypes.RESCAN_LIBRARY,
        "rescanLibrary()",
        error.stderr || error.message || error
      )
    }
  }
}

export default MusicServer
