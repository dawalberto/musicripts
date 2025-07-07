// downloader/Downloader.ts
import { exec } from "child_process"
import fs from "fs"
import { promisify } from "util"
import { YOUTUBE_TITLE_TAGS_ENGLISH, YOUTUBE_TITLE_TAGS_SPANISH } from "../constants"
import { ErrorType, VideoData } from "../types"
import { getLogErrorMessage, logMessage } from "../utils/logger"

const execPromise = promisify(exec)

export class Downloader {
  private url: string
  private outputDir: string
  public sanitizedTitle: string | null = null
  private downloadedFilePath: string | null = null

  constructor(url: string, outputDir = "./downloads-TODO") {
    this.url = url
    this.outputDir = outputDir
  }

  public async getSanitizedTitle(): Promise<void> {
    logMessage("🔤 Getting sanitized title from video...")
    try {
      const { stdout } = await execPromise(`yt-dlp -j "${this.url}"`)
      const info: VideoData = JSON.parse(stdout)
      const title = info.title || info.fulltitle

      if (!title) {
        throw new Error("No title found in video.")
      }

      this.sanitizedTitle = this.sanitizeTitle(title, [
        ...YOUTUBE_TITLE_TAGS_ENGLISH,
        ...YOUTUBE_TITLE_TAGS_SPANISH,
      ])
    } catch (err: any) {
      const errorMsg = getLogErrorMessage(
        ErrorType.GET_VIDEO_TITLE_ERROR,
        err.stderr || err.message
      )
      throw new Error(errorMsg)
    }
  }

  public async downloadAudio() {
    logMessage("🎧 Downloading audio...")
    // TODO
  }

  private sanitizeTitle(title: string, tags: string[]): string {
    let sanitized = title
    for (const tag of tags) {
      sanitized = sanitized.replace(tag, "").trim()
    }
    return sanitized
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }
}
