import { ErrorTypes } from "../../types.js"
import { DownloadSourceFrom } from "../download-sources/types.js"
import logger from "../logger/logger.js"

class Notifier {
  private _downloadFrom: string | null = null
  private _downloadedSongsTitles: Set<string> = new Set()
  private _downloadedSongsArtists: Set<string> = new Set()
  // private spaceAvailable: number | null = null // TODO

  constructor() {}

  downloadFrom(value: DownloadSourceFrom) {
    switch (value) {
      case DownloadSourceFrom.SONGS_GIST:
        this._downloadFrom = "Canciones descargadas desde archivo gist"
        break
      case DownloadSourceFrom.PLAYLISTS_GIST:
        this._downloadFrom = "Canciones descargadas desde playlists en archivo gist"
        break
      case DownloadSourceFrom.SONG_URL:
        this._downloadFrom = "Canción descargada desde URL"
        break
      case DownloadSourceFrom.PLAYLIST_URL:
        this._downloadFrom = "Canciones descargadas desde playlist URL"
        break
      default:
        throw new Error("Invalid download source")
    }
  }

  addDownloadedSong(title: string, artist: string) {
    this._downloadedSongsTitles.add(title)
    this._downloadedSongsArtists.add(artist)
  }

  async sendNotification() {
    try {
      logger.start("📢 Sending notification...")
      if (!this._downloadFrom) {
        throw new Error("Download source not set")
      }
      if (this._downloadedSongsTitles.size === 0) {
        throw new Error("No songs downloaded to notify")
      }
      if (this._downloadedSongsArtists.size === 0) {
        throw new Error("No artists found to notify")
      }

      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: this.mountMessage(),
            parse_mode: "HTML",
          }),
        }
      )
      if (!response.ok) {
        logger.fail(
          ErrorTypes.SEND_NOTIFICATION,
          "sendNotification()",
          `Failed to send notification: ${response.statusText}`
        )
        throw new Error("Failed to send notification")
      }
      this._downloadedSongsTitles.clear()
      this._downloadedSongsArtists.clear()
      this._downloadFrom = null
      logger.succeed()
    } catch (error) {
      logger.fail(
        ErrorTypes.SEND_NOTIFICATION,
        "sendNotification()",
        error instanceof Error ? error.message : String(error)
      )
      return
    }
  }

  private mountMessage(): string {
    const songs = Array.from(this._downloadedSongsTitles)
      .map((song) => `🎵 ${song}`)
      .join("\n")
    const artists = Array.from(this._downloadedSongsArtists)
      .map((artist) => `🎤 ${artist}`)
      .join("\n")

    let date = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    date = date.charAt(0).toUpperCase() + date.slice(1)

    return `<b>${this._downloadedSongsTitles.size} canciones añadidas:</b>\n${songs} \n\n<b>De ${this._downloadedSongsArtists.size} artistas:</b>\n${artists} \n\n<i>🌐 ${this._downloadFrom}</i>\n<i>🗓️ ${date}</i>`
  }
}

const notifier = new Notifier()
export default notifier
