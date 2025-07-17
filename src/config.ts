import { NodeEnv } from "./types"

const nodeEnv = process.env.NODE_ENV as NodeEnv | undefined

export const IS_PRODUCTION = nodeEnv === NodeEnv.PRODUCTION
export const IS_DEVELOPMENT = nodeEnv === NodeEnv.DEVELOPMENT

export const ENVIRONMENT_VARIABLES_REQUIRED = [
  "SPOTIFY_CLIENT_ID", // TODO - MAKE IT OPTIONAL
  "SPOTIFY_CLIENT_SECRET", // TODO - MAKE IT OPTIONAL
  "TELEGRAM_CHAT_ID", // TODO - MAKE IT OPTIONAL
  "TELEGRAM_BOT_TOKEN", // TODO - MAKE IT OPTIONAL
  "NODE_ENV", // Should be set to "development" or "production"
  "OUTPUT_DIR",
  "DOWNLOADS_ARCHIVE_PATH",
  "NAVIDROME_PATH", // TODO - MAKE IT OPTIONAL
]

export const DEPENDENCIES_REQUIRED = [
  "yt-dlp", // YouTube downloader
  "ffmpeg", // TODO - Find out if really needed
  "mp3gain", // For normalizing MP3s
]

if (IS_PRODUCTION) {
  DEPENDENCIES_REQUIRED.push("docker") // To rescan the music library
}
