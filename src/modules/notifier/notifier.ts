import { ErrorTypes } from "@/types.js"
import { DownloadSourceFrom, logger } from "../index.js"

class Notifier {
  private _downloadFrom: string | null = null
  private _downloadedSongsTitles: Map<string, string> = new Map()
  private _downloadedSongsArtists: Map<string, string> = new Map()
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

  addDownloadedSong({ id, title, artist }: { id: string; title: string; artist: string }) {
    this._downloadedSongsTitles.set(id, title)
    this._downloadedSongsArtists.set(id, artist)
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
    const songsTitles = Array.from(this._downloadedSongsTitles.entries())
    const songsArtists = Array.from(new Set(Array.from(this._downloadedSongsArtists.values())))
    const songs = songsTitles.map(([id, title]) => `🎵 <a href="${id}">${title}</a>`).join("\n")
    const artists = songsArtists.map((artist) => `🎤 ${artist}`).join("\n")

    let date = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    date = date.charAt(0).toUpperCase() + date.slice(1)

    return `<b>${songsTitles.length} canciones añadidas:</b>\n${songs} \n\n<b>De ${songsArtists.length} artistas:</b>\n${artists} \n\n<i>🌐 ${this._downloadFrom}</i>\n<i>🗓️ ${date}</i>`
  }
}

export const notifier = new Notifier()
