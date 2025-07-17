import "dotenv/config"
import DownloadSources from "./download-sources/download-sources.js"
import Downloader from "./downloader/downloader.js"
import Metadater from "./metadater/metadater.js"
import Normalizer from "./normalizer/normalizer.js"
import notifier from "./notifier/notifier.js"
import { AppInitializer } from "./utils/app-initializer.js"
import logger from "./utils/logger.js"
import MusicServer from "./utils/music-server.js"

async function main() {
  // TODO - Handle trying to save song already downloaded(it is possible by passing a new --archive but same --output)
  // TODO - Save title and artist for notifying from metadata if available
  // TODO - Make normalizer optional
  // TODO - Tests
  // TODO - Split notifier message into multiple messages if too long
  // TODO - Github releases
  // TODO - Github actions to run this script on a schedule

  try {
    const { downloadFrom, urlSourceToDownload, outputDir, archiveFile } = new AppInitializer()

    const downloaderSources = new DownloadSources({
      downloadFrom,
      urlSourceToDownload,
      archiveFile,
    })
    const songsUrlsToDownload = await downloaderSources.getSongsUrlsToDownload()

    const downloader = new Downloader({
      songsUrlsToDownload,
      outputDir,
      archiveFile,
    })
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
