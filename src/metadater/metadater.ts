import { ErrorTypes } from "../types/errors"
import logger from "../utils/logger"

class Metadater {
  private spotifyToken: string | null = null

  constructor() {}

  async init(): Promise<void> {
    await this.getSpotifyToken()
  }

  public async getMetadataFromQuery(query: string): Promise<any> {
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
      const data = await response.json()
      console.log("💣🚨 data", JSON.stringify(data, null, 2))
    } catch (error: any) {
      logger.fail(
        ErrorTypes.GET_METADATA_FROM_QUERY,
        "getMetadataFromQuery()",
        `There was an error getting metadata for query: ${query}`
      )
      throw new Error(error)
    }

    // Implement the logic to fetch metadata from Spotify API using the token
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
}

export default Metadater
