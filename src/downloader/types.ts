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

export type DownloadedSongsData = {
  id: string
  path: string
  spotifyQuerySearch: string
}
