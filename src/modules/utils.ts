import { exec, ExecException } from "child_process"
import { getLogErrorMessage, logMessage, logSuccessMessage } from "./logger"
import { ErrorType, VideoData } from "./types"

export function getVideoTitle(url: string) {
  logMessage("🔤 Getting video title...")
  return new Promise<string>((resolve, reject) => {
    exec(`yt-dlp -j "${url}"`, (err: ExecException | null, stdout: string, stderr: string) => {
      if (err) {
        reject(getLogErrorMessage(ErrorType.GET_VIDEO_TITLE_ERROR, stderr))
        return
      }
      const info: VideoData = JSON.parse(stdout)
      const title = info.title || info.fulltitle
      logSuccessMessage(`getVideoTitle: ${title}`)
      resolve(title)
    })
  })
}
