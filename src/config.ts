import { NodeEnv } from "./types/common"

const nodeEnv = process.env.NODE_ENV as NodeEnv | undefined

export const ENVIRONMENT_VARIABLES_REQUIRED = [
  "SPOTIFY_CLIENT_ID", // TODO - MAKE IT OPTIONAL
  "SPOTIFY_CLIENT_SECRET", // TODO - MAKE IT OPTIONAL
  "TELEGRAM_CHAT_ID", // TODO - MAKE IT OPTIONAL
  "TELEGRAM_BOT_TOKEN", // TODO - MAKE IT OPTIONAL
  "OUTPUT_DIR",
  "DOWNLOADS_ARCHIVE_PATH",
]

export const DEPENDENCIES_REQUIRED = [
  "yt-dlp", // YouTube downloader
  "ffmpeg", // TODO - Find out if really needed
]

if (nodeEnv === NodeEnv.PRODUCTION) {
  DEPENDENCIES_REQUIRED.push("docker") // To rescan the music library
}
