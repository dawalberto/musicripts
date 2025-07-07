import "dotenv/config"
import { getTitleFromVideo } from "./downloader/downloader"

async function main() {
  try {
    // TODO - Check if the environment variables are set and if not, throw an error
    // TODO - Show help if no arguments are passed and exit
    // TODO - Check for dependencies, e.g., ffmpeg, youtube-dl, etc. if not installed, throw an error
    // TODO - Fetch videos from gists
    // TODO - Check if the video is already downloaded
    // TODO - Login API Spotify
    // TODO - Download the video in mp3 if not already downloaded
    const title = await getTitleFromVideo("https://www.youtube.com/watch?v=O4f58BU_Hbs")
    // TODO - Get metadata from video title
    // TODO - Set metadata received to downloaded mp3 file
    // TODO - Reescan server
    // TODO - Send notification
  } catch (error) {
    console.error("\n\x1b[1m❌ ERROR:\x1b[0m", error)
  }
}

main()
