import "dotenv/config"
import DownloadSources from "./download-sources/download-sources"
import { Downloader } from "./downloader/downloader"
import { DownloadSourceFrom } from "./types"
import { AppInitializer } from "./utils/app-initializer"
import logger from "./utils/logger"

async function main() {
  const songUrl = "https://www.youtube.com/watch?v=O4f58BU_Hbs" // single song
  const playlistUrl =
    "https://youtube.com/playlist?list=PLqcOK7ksKCFAgur0Jo_724vRjVfYwPO6r&feature=shared" // single playlist
  const playlistsGistUrl =
    "https://gist.githubusercontent.com/dawalberto/f02117bfd6932d2fb79a96a2f7bf7f16/raw/playlists" // set of playlists
  const songsGistUrl =
    "https://gist.githubusercontent.com/dawalberto/a45c871dad26c0bd6341892f3a5c7b16/raw/songs" // set of songs

  try {
    new AppInitializer()
    const downloaderSources = new DownloadSources({
      downloadFrom: DownloadSourceFrom.PLAYLISTS_GIST,
      urlSourceToDownload: playlistsGistUrl,
    })
    // TODO - Show help if no arguments are passed and exit
    const videosUrlsToDownload = await downloaderSources.getSongsUrlsToDownload()
    if (videosUrlsToDownload.length === 0) {
      logger.warn("No URLs to download found or all urls already downloaded previously.")
      process.exit(0)
    }
    console.log("🦊 videosUrlsToDownload", videosUrlsToDownload)
    // TODO - Login API Spotify (SUBTODO - Make it optional)
    const downloader = new Downloader({ videosUrlsToDownload })
    downloader.download()
    // TODO - Get metadata from video title
    // TODO - Download the video in mp3 if not already downloaded
    // TODO - Set metadata received to downloaded mp3 file
    // TODO - Reescan server
    // TODO - Send notification
    // process.exit(0)
  } catch (error) {
    logger.failAndPersist()
    console.error("\x1b[1m❌ ERROR:\x1b[0m", error)
    process.exit(1)
  }
}

main()
