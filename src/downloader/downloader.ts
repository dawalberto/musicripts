import { exec } from "child_process"
import fs from "fs"
import { promisify } from "util"
import {
  CHARACTERS_TO_REMOVE,
  YOUTUBE_TITLE_TAGS_ENGLISH,
  YOUTUBE_TITLE_TAGS_SPANISH,
} from "../constants"
import { ErrorTypes } from "../types/errors"
import logger from "../utils/logger"
import { DownloadedSongData, VideoData } from "./types"

const execPromise = promisify(exec)

class Downloader {
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

    const downloadedSongsData: DownloadedSongData[] = []

    for (let i = 0; i < this.videosUrlsToDownload.length; i++) {
      const videoUrl = this.videosUrlsToDownload[i]
      try {
        downloadedSongsData.push(await this.downloadSong(videoUrl))
        logger.start(`Downloaded ${i + 1} of ${this.videosUrlsToDownload.length} songs`)
      } catch (err: any) {
        logger.fail(ErrorTypes.DOWNLOAD, "download()", err.stderr || err.message || err)
      }
    }

    logger.succeed()
    return downloadedSongsData
  }

  private async downloadSong(videoUrl: string): Promise<DownloadedSongData> {
    try {
      const videoData = await this.getVideoData(videoUrl)
      const title = this.sanitizeTitle(videoData.title || videoData.fulltitle || "", [
        ...YOUTUBE_TITLE_TAGS_ENGLISH,
        ...YOUTUBE_TITLE_TAGS_SPANISH,
        ...CHARACTERS_TO_REMOVE,
      ])
      logger.start(`Downloading song: ${title}`)
      const downloadedSongPath = await this.downloadSongAndGetPath(videoUrl)

      const querySearch = this.getQuerySearch({
        title,
        tags: videoData.tags,
        channel: videoData.channel,
        uploader: videoData.uploader,
      })

      logger.succeed()
      return {
        id: videoUrl,
        path: downloadedSongPath,
        spotifyQuerySearch: querySearch,
      }
    } catch (err: any) {
      logger.fail(ErrorTypes.DOWNLOAD, "downloadSong()", err.stderr || err.message || err)
      throw new Error(err)
    }
  }

  private async getVideoData(videoUrl: string): Promise<VideoData> {
    try {
      const cmd = `yt-dlp -j "${videoUrl}"`
      const { stdout } = await execPromise(cmd)
      return JSON.parse(stdout) as VideoData
    } catch (err: any) {
      logger.fail(ErrorTypes.GET_VIDEO_DATA, "getVideoData()", err.stderr || err.message || err)
      throw new Error(err)
    }
  }

  private async downloadSongAndGetPath(videoUrl: string): Promise<string> {
    try {
      const downloadCmd = `yt-dlp -f bestaudio -x --audio-format mp3 --audio-quality 0 --restrict-filenames --download-archive "${process.env.DOWNLOADS_ARCHIVE_PATH}" -o "${this.outputDir}/%(title)s.%(ext)s" "${videoUrl}"`
      const { stdout: downloadLog } = await execPromise(downloadCmd)
      const songPath = this.getSongPathFromLog(downloadLog)

      if (!songPath) {
        logger.fail(
          ErrorTypes.DOWNLOAD,
          "downloadSongAndGetPath()",
          "No path found. Failed to extract song path from download log."
        )
        throw new Error("Failed to extract song path from download log.")
      }

      if (!fs.existsSync(songPath)) {
        logger.fail(
          ErrorTypes.DOWNLOAD,
          "downloadSongAndGetPath()",
          `Downloaded file does not exist at path: ${songPath}`
        )
        throw new Error(`Downloaded file does not exist at path: ${songPath}`)
      }
      return songPath
    } catch (err: any) {
      logger.fail(ErrorTypes.DOWNLOAD, "downloadSongAndGetPath()", err.stderr || err.message || err)
      throw new Error(err)
    }
  }

  private getQuerySearch({ title, tags, channel, uploader }: VideoData): string {
    const extraInfo = tags?.length
      ? tags?.join(" ").slice(0, 250 - (title?.length || 0)) || ""
      : channel || uploader || ""
    return `${title} ${extraInfo}`
  }

  private getSongPathFromLog(log: string): string | null {
    const match = log.match(/\[ExtractAudio\] Destination: (.+\.mp3)/)
    return match ? match[1].trim() : null
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

export default Downloader
