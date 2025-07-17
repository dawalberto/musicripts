import "dotenv/config"
import { AppInitializer } from "./modules/app-initializer/app-initializer.js"
import DownloadSources from "./modules/download-sources/download-sources.js"
import Downloader from "./modules/downloader/downloader.js"
import logger from "./modules/logger/logger.js"
import Metadater from "./modules/metadater/metadater.js"
import MusicServer from "./modules/music-server/music-server.js"
import Normalizer from "./modules/normalizer/normalizer.js"
import notifier from "./modules/notifier/notifier.js"

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
