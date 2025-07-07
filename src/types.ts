export enum ErrorType {
  GET_VIDEO_TITLE_ERROR = "GET_VIDEO_TITLE_ERROR",
  DOWNLOAD_VIDEO_ERROR = "DOWNLOAD_VIDEO_ERROR",
  CONVERT_VIDEO_ERROR = "CONVERT_VIDEO_ERROR",
}

export type VideoData = {
  title?: string
  description?: string
  tags?: string[]
  channel?: string
  uploader?: string
  fulltitle?: string
  duration_string?: string
  release_date?: string
  release_year?: number
  is_live?: boolean
}
