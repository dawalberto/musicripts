import NodeID3 from "node-id3"
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
    await this.setMetadataToDownloadedSongsData()
    logger.succeed("✅ Metadata set to downloaded songs")
  }

  private async setMetadataToDownloadedSongsData(): Promise<void> {
    for (const song of this.downloadedSongsData) {
      logger.start(`Fetching and setting metadata for song: ${song.title}`)
      const metadata = await this.getMetadataFromQuery(song.spotifyQuerySearch)
      if (metadata) {
        await this.setMetadataToMp3(song.path, metadata)
        logger.succeed()
      } else {
        logger.warn(
          `No metadata found for song: ${song.title}. Setting default metadata(only title and artist).`
        )
        this.setMetadataToMp3(song.path, {
          title: song.title,
          artist: [song.artist],
          album: "",
          albumArtist: [],
          trackNumber: 0,
          discNumber: 0,
          date: "",
          ISRC: null,
          explicit: false,
          coverart: null,
        })
      }
    }
  }

  private async getMetadataFromQuery(query: string): Promise<SongMetadataTags | null> {
    try {
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

      const data: SpotifyTrackSearchResponse = await response.json()
      if (!data || !data.tracks || data.tracks.items.length === 0) {
        return null
      }
      const trackData: SpotifyTrack = data.tracks.items[0]
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

  private async setMetadataToMp3(mp3Path: string, metadata: SongMetadataTags): Promise<void> {
    try {
      const separator = " / "
      let imageBuffer: Buffer | undefined

      if (metadata.coverart) {
        const response = await fetch(metadata.coverart)
        imageBuffer = Buffer.from(await response.arrayBuffer())
      }

      const date = metadata.date.length >= 4 ? metadata.date : undefined
      const year = metadata.date.length >= 4 ? metadata.date.slice(0, 4) : metadata.date

      const tags: NodeID3.Tags = {
        title: metadata.title,
        artist: metadata.artist.join(separator),
        album: metadata.album,
        performerInfo: metadata.albumArtist.join(separator),
        trackNumber: metadata.trackNumber.toString(),
        partOfSet: metadata.discNumber.toString(),
        date,
        year,
        comment: {
          language: "eng",
          text: `Explicit: ${metadata.explicit}`,
        },
        ISRC: metadata.ISRC || "",
        image: imageBuffer
          ? {
              mime: "image/jpeg",
              type: { id: 3, name: "front cover" },
              description: "Cover",
              imageBuffer,
            }
          : undefined,
      }

      const result = NodeID3.write(tags, mp3Path)

      if (result !== true) {
        logger.fail(
          ErrorTypes.SET_METADATA_TO_MP3,
          "setMetadataToMp3()",
          `Failed to write metadata to MP3 file: ${mp3Path}. Result: ${result}`
        )
        throw new Error(`Failed to write metadata to MP3 file: ${mp3Path}. Result: ${result}`)
      }
    } catch (error: any) {
      logger.fail(
        ErrorTypes.SET_METADATA_TO_MP3,
        "setMetadataToMp3()",
        `There was an error setting metadata to MP3 file: ${mp3Path}`
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
        throw new Error("Failed to obtain Spotify token")
      }

      this.spotifyToken = token
      logger.succeed()
    } catch (error: any) {
      logger.fail(
        ErrorTypes.METADATA_AUTH,
        "getSpotifyToken()",
        "There was an error obtaining the Spotify token. Only the title and artist will be set as metadata."
      )
      this.spotifyToken = null
      return
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
      ISRC: trackData.external_ids?.isrc || null,
      explicit: trackData.explicit,
      coverart: album.images?.[0]?.url || null,
    }
  }
}

export default Metadater
