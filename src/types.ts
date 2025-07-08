export enum ErrorType {
  GET_VIDEO_TITLE_ERROR = "GET_VIDEO_TITLE_ERROR",
  MISSING_ENV_VARIABLES = "MISSING_ENV_VARIABLES",
  MISSING_DEPENDENCIES = "MISSING_DEPENDENCIES",
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
