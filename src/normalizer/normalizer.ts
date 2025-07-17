import { exec } from "child_process"
import { promisify } from "util"
import { DownloadedSongData } from "../downloader/types.js"
import { ErrorTypes } from "../types/errors.js"
import logger from "../utils/logger.js"
const execPromise = promisify(exec)

class Normalizer {
  private _downloadedSongs: DownloadedSongData[]

  constructor(downloadedSongs: DownloadedSongData[]) {
    this._downloadedSongs = downloadedSongs
  }

  async init() {
    try {
      logger.start("📊 Normalizing downloaded songs...")
      for (const song of this._downloadedSongs) {
        const mp3 = song.path
        if (!mp3) {
          logger.warn(`No path found for song: ${song.title}`)
          continue
        }
        await execPromise(`mp3gain -r -k "${mp3}"`)
      }
      logger.succeed()
    } catch (error) {
      logger.fail(
        ErrorTypes.NORMALIZE_DOWNLOADS,
        "normalizeDownloadedMP3s()",
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}

export default Normalizer
