import "dotenv/config"
import { Downloader } from "./downloader/downloader"
import { AppInitializer } from "./utils/app-initializer"
import logger from "./utils/logger"

async function main() {
  const url = "https://www.youtube.com/watch?v=O4f58BU_Hbs" // this will be replaced with the actual URL from the gist in a loop
  try {
    new AppInitializer()
    // TODO - Show help if no arguments are passed and exit
    // TODO - Fetch videos from gists
    // TODO - Check if the video is already downloaded
    // TODO - Login API Spotify
    const downloader = new Downloader(url)
    await downloader.getSanitizedTitle()
    console.log("Sanitized Title:", downloader.sanitizedTitle)
    // TODO - Download the video in mp3 if not already downloaded
    // TODO - Get metadata from video title
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
