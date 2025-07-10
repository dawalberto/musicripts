export enum ErrorType {
  GET_VIDEO_TITLE_ERROR = "GET_VIDEO_TITLE_ERROR",
  MISSING_ENV_VARIABLES = "MISSING_ENV_VARIABLES",
  MISSING_DEPENDENCIES = "MISSING_DEPENDENCIES",
  GET_URLS_FROM_PLAYLIST = "GET_URLS_FROM_PLAYLIST",
  GET_URLS_FROM_GIST = "GET_URLS_FROM_GIST",
  FETCH_ERROR = "FETCH_ERROR",
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

export enum DownloadSourceFrom {
  SONGS_GIST = "songs-gist",
  PLAYLISTS_GIST = "playlists-gist",
  SONG_URL = "song-url",
  PLAYLIST_URL = "playlist-url",
}
