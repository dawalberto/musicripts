export type SpotifyTrackSearchResponse = {
  href: string
  limit: number
  next: string
  offset: number
  previous: any
  total: number
  items: Array<SpotifyTrack>
}

export type SpotifyTrack = {
  album: {
    album_type: string
    artists: Array<{
      external_urls: {
        spotify: string
      }
      href: string
      id: string
      name: string
      type: string
      uri: string
    }>
    available_markets: Array<string>
    external_urls: {
      spotify: string
    }
    href: string
    id: string
    images: Array<{
      height: number
      width: number
      url: string
    }>
    is_playable: boolean
    name: string
    release_date: string
    release_date_precision: string
    total_tracks: number
    type: string
    uri: string
  }
  artists: Array<{
    external_urls: {
      spotify: string
    }
    href: string
    id: string
    name: string
    type: string
    uri: string
  }>
  available_markets: Array<string>
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: {
    isrc: string
  }
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  is_local: boolean
  is_playable: boolean
  name: string
  popularity: number
  preview_url: any
  track_number: number
  type: string
  uri: string
}
export type SongMetadataTags = {
  title: string
  artist: string[]
  album: string
  albumArtist: string[]
  trackNumber: number
  discNumber: number
  date: string
  isrc: string | null
  explicit: boolean
  coverart: string | null
}
