import { exec } from "child_process"
import fs from "fs"
import { promisify } from "util"
import {
  CHARACTERS_TO_REMOVE,
  YOUTUBE_TITLE_TAGS_ENGLISH,
  YOUTUBE_TITLE_TAGS_SPANISH,
} from "../constants"
import { ErrorType, VideoData } from "../types"
import logger from "../utils/logger"

const execPromise = promisify(exec)

export class Downloader {
  private videosUrlsToDownload: string[]
  private outputDir: string = process.env.OUTPUT_DIR || ""

  constructor({
    videosUrlsToDownload,
    outputDir,
  }: {
    videosUrlsToDownload: string[]
    outputDir?: string
  }) {
    this.videosUrlsToDownload = videosUrlsToDownload

    // TODO - Check this in app-initializer
    outputDir && (this.outputDir = outputDir)
    this.ensureOutputDir()
  }

  async download() {
    logger.start("📥 Downloading videos as mp3 files...")
    for (const videoUrl of this.videosUrlsToDownload) {
      const title = await this.getSanitizedTitle(videoUrl)
      // console.log("💣🚨 title", title)
    }
    logger.succeed()
  }

  private async getSanitizedTitle(videoUrl: string): Promise<string> {
    try {
      const { stdout } = await execPromise(`yt-dlp -j "${videoUrl}"`)
      const info: VideoData = JSON.parse(stdout)
      const title = info.title || info.fulltitle
      console.log(
        "💣🚨 info",
        JSON.stringify(
          {
            title,
            tags: info.tags?.join(", ") || "No tags found",
            channel: info.channel,
            uploader: info.uploader,
          },
          null,
          2
        )
      )

      if (!title) {
        throw new Error("No title found in video.")
      }

      return this.sanitizeTitle(title, [
        ...YOUTUBE_TITLE_TAGS_ENGLISH,
        ...YOUTUBE_TITLE_TAGS_SPANISH,
        ...CHARACTERS_TO_REMOVE,
      ])
    } catch (err: any) {
      logger.fail(
        ErrorType.GET_VIDEO_TITLE_ERROR,
        "getSanitizedTitle()",
        err.stderr || err.message || err
      )
      throw new Error(err)
    }
  }

  private async downloadAudio() {
    // TODO - Download mp3 in the best quality available, restrict-filnames to save them in
  }

  private sanitizeTitle(title: string, tags: string[]): string {
    let sanitized = title
    for (const tag of tags) {
      sanitized = sanitized.replaceAll(tag, "").trim()
    }
    return sanitized
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }
}
