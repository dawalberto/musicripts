import { DownloadedSongData } from "../downloader/types"
import { ErrorTypes } from "../types/errors"
import logger from "../utils/logger"
import { SongMetadataTags, SpotifyTrack, SpotifyTrackSearchResponse } from "./types"

class Metadater {
  private spotifyToken: string | null = null
  private downloadedSongsData: DownloadedSongData[]

  constructor(downloadedSongsData: DownloadedSongData[]) {
    this.downloadedSongsData = downloadedSongsData
  }

  async init(): Promise<void> {
    await this.getSpotifyToken()
    for (const song of this.downloadedSongsData) {
      const metadata = await this.getMetadataFromQuery(song.spotifyQuerySearch)
      if (metadata) {
        // TODO - Set metadata to the song
        logger.succeed(`Metadata set for song: ${JSON.stringify(metadata, null, 2)}`)
      } else {
        logger.warn(`No metadata found for song: ${song}`)
      }
    }
  }

  private async getMetadataFromQuery(query: string): Promise<SongMetadataTags | null> {
    try {
      logger.start(`🔍 Fetching metadata for query: ${query.slice(0, 12)}...`)
      if (!this.spotifyToken) {
        logger.warn("No Spotify token available")
        return null
      }

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${this.spotifyToken}`,
          },
        }
      )

      logger.succeed()
      const data: SpotifyTrackSearchResponse = await response.json()
      if (!data || !data.items || data.items.length === 0) {
        logger.warn("No tracks found for the given query")
        return null
      }
      const trackData: SpotifyTrack = data.items[0]
      return this.spotifyTrackDataToSongMetadataTags(trackData)
    } catch (error: any) {
      logger.fail(
        ErrorTypes.GET_METADATA_FROM_QUERY,
        "getMetadataFromQuery()",
        `There was an error getting metadata for query: ${query}`
      )
      throw new Error(error)
    }
  }

  private async getSpotifyToken(): Promise<void> {
    logger.start("🔑 Obtaining Spotify token...")
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    const authB64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authB64}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
      })

      const data = await response.json()
      const token = data.access_token

      if (!token) {
        logger.fail(
          ErrorTypes.METADATA_AUTH,
          "getSpotifyToken()",
          "There was an error obtaining the Spotify token"
        )
        throw new Error("No token received from Spotify API")
      }

      this.spotifyToken = token
      logger.succeed()
    } catch (error: any) {
      logger.fail(
        ErrorTypes.METADATA_AUTH,
        "getSpotifyToken()",
        "There was an error obtaining the Spotify token"
      )
      throw new Error(error)
    }
  }

  private spotifyTrackDataToSongMetadataTags(trackData: SpotifyTrack): SongMetadataTags {
    const album = trackData.album

    return {
      title: trackData.name,
      artist: trackData.artists.map((a) => a.name),
      album: album.name,
      albumArtist: album.artists.map((a) => a.name),
      trackNumber: trackData.track_number,
      discNumber: trackData.disc_number,
      date: album.release_date,
      isrc: trackData.external_ids?.isrc || null,
      explicit: trackData.explicit,
      coverart: album.images?.[0]?.url || null,
    }
  }
}

export default Metadater
