import "dotenv/config"
import DownloadSources from "./download-sources/download-sources"
import { DownloadSourceFrom } from "./download-sources/types"
import Downloader from "./downloader/downloader"
import Metadater from "./metadater/metadater"
import Normalizer from "./normalizer/normalizer"
import notifier from "./notifier/notifier"
import { AppInitializer } from "./utils/app-initializer"
import logger from "./utils/logger"
import MusicServer from "./utils/music-server"

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
    // TODO - Show help if no arguments are passed and exit

    const downloaderSources = new DownloadSources({
      downloadFrom: DownloadSourceFrom.SONGS_GIST,
      urlSourceToDownload: songsGistUrl,
    })
    const videosUrlsToDownload = await downloaderSources.getSongsUrlsToDownload()
    if (videosUrlsToDownload.length === 0) {
      logger.warn("No URLs to download found or all urls already downloaded previously.")
      process.exit(0)
    }

    const downloader = new Downloader({ videosUrlsToDownload })
    const downloadedSongsData = await downloader.download()

    const normalizer = new Normalizer(downloadedSongsData)
    await normalizer.init()

    const metadater = new Metadater(downloadedSongsData)
    await metadater.init()

    const musicServer = new MusicServer()
    await musicServer.rescanLibrary()

    await notifier.sendNotification()
    process.exit(0)
  } catch (error) {
    logger.failAndPersist()
    console.error("\x1b[1m❌ ERROR:\x1b[0m", error)
    process.exit(1)
  }
}

main()
