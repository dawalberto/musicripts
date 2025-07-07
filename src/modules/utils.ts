import { exec, ExecException } from "child_process"
import { YOUTUBE_TITLE_TAGS_ENGLISH, YOUTUBE_TITLE_TAGS_SPANISH } from "./constants"
import { getLogErrorMessage, logMessage } from "./logger"
import { ErrorType, VideoData } from "./types"

export function getTitleFromVideo(url: string) {
  logMessage("🔤 Getting sanitized title from video...")
  return new Promise<string>((resolve, reject) => {
    exec(`yt-dlp -j "${url}"`, (err: ExecException | null, stdout: string, stderr: string) => {
      if (err) {
        reject(getLogErrorMessage(ErrorType.GET_VIDEO_TITLE_ERROR, stderr))
        return
      }
      const info: VideoData = JSON.parse(stdout)
      const title = info.title || info.fulltitle
      if (!title) {
        reject(getLogErrorMessage(ErrorType.GET_VIDEO_TITLE_ERROR, "No title found"))
        return
      }
      const sanitizedTitle = sanitizeTitle(title, [
        ...YOUTUBE_TITLE_TAGS_ENGLISH,
        ...YOUTUBE_TITLE_TAGS_SPANISH,
      ])
      resolve(sanitizedTitle)
    })
  })
}

function sanitizeTitle(title: string, tags: string[]) {
  let sanitidedTitle = title
  for (const tag of tags) {
    sanitidedTitle = sanitidedTitle.replace(tag, "").trim()
  }
  return sanitidedTitle
}
