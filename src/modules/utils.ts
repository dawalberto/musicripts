import { exec, ExecException } from "child_process";
import { logError } from "./errors-handler";
import { ErrorType } from "./types";

export function getVideoTitle(url: string) {
  console.log("🔤 Getting video title...");
  return new Promise<string>((resolve, reject) => {
    exec(`yt-dlp -j "${url}"`, (err: ExecException | null, stdout: string, stderr: string) => {
      if (err) {
        reject(logError(ErrorType.GET_VIDEO_TITLE_ERROR, stderr));
        return;
      }
      const info = JSON.parse(stdout);
      resolve(info.fulltitle);
    });
  });
}
