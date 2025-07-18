import { ErrorTypes } from "@/types.js"
import { exec } from "child_process"
import { promisify } from "util"
import { logger, notifier } from "../index.js"
import { DownloadSourceFrom } from "./types.js"

const execPromise = promisify(exec)

export class DownloadSources {
  private downloadFrom: DownloadSourceFrom
  private urlSourceToDownload: string
  private archiveFile: string

  constructor({
    downloadFrom,
    urlSourceToDownload,
    archiveFile,
  }: {
    downloadFrom: DownloadSourceFrom
    urlSourceToDownload: string
    archiveFile: string
  }) {
    this.downloadFrom = downloadFrom
    this.urlSourceToDownload = urlSourceToDownload
    this.archiveFile = archiveFile
    notifier.downloadFrom(downloadFrom)
  }

  async getSongsUrlsToDownload(): Promise<string[]> {
    let songsUrls: string[] = []
    switch (this.downloadFrom) {
      case DownloadSourceFrom.SONGS_GIST:
        songsUrls = await this.fetchGist()
        break
      case DownloadSourceFrom.PLAYLISTS_GIST:
        songsUrls = await this.getSongsIdsFromPlaylistUrls()
        break
      case DownloadSourceFrom.SONG_URL:
        songsUrls = [this.urlSourceToDownload]
        break
      case DownloadSourceFrom.PLAYLIST_URL:
        songsUrls = await this.getSongsIdsFromPlaylistUrls(this.urlSourceToDownload)
        break
      default:
        throw new Error("Invalid download source")
    }
    const alreadyDownloaded: boolean[] = await Promise.all(
      songsUrls.map((url) => this.isVideoAlreadyDownloaded(url))
    )
    const songsUrlsToDownload = songsUrls.filter((_, i) => !alreadyDownloaded[i])
    if (!songsUrlsToDownload.length) {
      logger.warn("⚠️  No URLs to download found or all urls already downloaded previously.")
      process.exit(0)
    }
    return songsUrlsToDownload
  }

  private async fetchGist(): Promise<string[]> {
    try {
      logger.start("📜 Fetching URLs from gist...")
      const response = await fetch(this.urlSourceToDownload)
      if (!response.ok) {
        logger.fail(
          ErrorTypes.FETCH,
          "fetchGist()",
          `Failed to fetch from ${this.urlSourceToDownload}: ${response.statusText}`
        )
        throw new Error("Failed to fetch URLs from gist")
      }
      const text = await response.text()
      const urls = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("http"))

      if (!text || !urls.length) {
        logger.fail(
          ErrorTypes.GET_URLS_FROM_GIST,
          "fetchGist()",
          `No URLs found in gist at ${this.urlSourceToDownload}`
        )
        throw new Error("No URLs found in gist")
      }

      logger.succeed()
      return urls
    } catch (error) {
      logger.fail(
        ErrorTypes.GET_URLS_FROM_GIST,
        "fetchGist()",
        error instanceof Error ? error.message : String(error)
      )
      throw new Error("Failed to fetch URLs from gist")
    }
  }

  private async getSongsIdsFromPlaylistUrls(playlistUrl?: string): Promise<string[]> {
    try {
      const playlistUrls = playlistUrl ? [playlistUrl] : await this.fetchGist()
      if (!playlistUrls.length) {
        logger.fail(
          ErrorTypes.GET_URLS_FROM_PLAYLIST,
          "getSongsIdsFromPlaylistUrls()",
          "No URLs found in playlist"
        )
        throw new Error("No URLs found in playlist")
      }
      let songIds: string[] = []
      for (const url of playlistUrls) {
        const { stdout } = await execPromise(`yt-dlp --flat-playlist --get-url "${url}"`)
        if (stdout) {
          songIds = [
            ...songIds,
            ...stdout
              .split("\n")
              .map((id) => id.trim())
              .filter(Boolean),
          ]
        }
      }
      logger.succeed()
      return songIds
    } catch (error) {
      logger.fail(
        ErrorTypes.GET_URLS_FROM_PLAYLIST,
        "getSongsIdsFromPlaylistUrls()",
        error instanceof Error ? error.message : String(error)
      )
      throw new Error("Failed to fetch URLs from playlist")
    }
  }

  private async isVideoAlreadyDownloaded(url: string): Promise<boolean> {
    const videoId = new URL(url).searchParams.get("v") || ""
    const { stdout } = await execPromise(`cat ${this.archiveFile}`)
    return stdout.includes(videoId)
  }
}
