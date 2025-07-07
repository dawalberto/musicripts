import { exec, ExecException } from "child_process"
import { getLogErrorMessage, logMessage, logSuccessMessage } from "./logger"
import { ErrorType, VideoData } from "./types"

export function getEssentialDataFromVideo(url: string) {
  logMessage("🔤 Getting essential data from video...")
  return new Promise<VideoData>((resolve, reject) => {
    exec(`yt-dlp -j "${url}"`, (err: ExecException | null, stdout: string, stderr: string) => {
      if (err) {
        reject(getLogErrorMessage(ErrorType.GET_VIDEO_TITLE_ERROR, stderr))
        return
      }
      const info: VideoData = JSON.parse(stdout)
      const videoEssentialData: VideoData = {
        title: info.title || info.fulltitle,
        uploader: info.uploader || info.channel,
        tags: info.tags || [],
      }
      logSuccessMessage(`Video essential data: \n${JSON.stringify(videoEssentialData, null, 2)}`)
      resolve(videoEssentialData)
    })
  })
}
