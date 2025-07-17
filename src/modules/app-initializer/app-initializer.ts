import { execSync } from "child_process"
import fs from "fs"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import {
  DEPENDENCIES_REQUIRED,
  ENVIRONMENT_VARIABLES_REQUIRED,
  IS_DEVELOPMENT,
} from "../../config.js"
import { ErrorTypes } from "../../types.js"
import { DownloadSourceFrom } from "../download-sources/types.js"
import logger from "../logger/logger.js"

export class AppInitializer {
  downloadFrom: DownloadSourceFrom = DownloadSourceFrom.SONGS_GIST
  urlSourceToDownload: string = process.env.DEVELOPMENT_SONGS_GIST_URL || ""
  outputDir: string = process.env.OUTPUT_DIR || ""
  archiveFile: string = process.env.DOWNLOADS_ARCHIVE_PATH || ""

  constructor() {
    this.checkEnvironmentVars(ENVIRONMENT_VARIABLES_REQUIRED)
    this.checkDependencies(DEPENDENCIES_REQUIRED)
    this.getArguments()
  }

  private checkEnvironmentVars(requiredVars: string[]) {
    logger.start("🔍 Checking environment variables...")
    const missing = requiredVars.filter((v) => !process.env[v])
    if (missing.length > 0) {
      logger.fail(
        ErrorTypes.MISSING_ENV_VARIABLES,
        "checkEnvironmentVars()",
        `Missing required environment variables: ${missing.join(", ")}`
      )
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
    }
    logger.succeed()
  }

  private checkDependencies(deps: string[]) {
    logger.start("🔍 Checking dependencies...")
    for (const dep of deps) {
      try {
        execSync(`which ${dep}`, { stdio: "ignore" })
      } catch {
        logger.fail(
          ErrorTypes.MISSING_DEPENDENCIES,
          "checkDependencies()",
          `Dependency not found: ${dep}`
        )
        throw new Error(`Dependency not found: ${dep}`)
      }
    }
    logger.succeed()
  }

  private getArguments() {
    if (IS_DEVELOPMENT) {
      return
    }

    const argv = yargs(hideBin(process.argv))
      .option("downloadFrom", {
        alias: "from",
        type: "string",
        description: "Source to download from",
        choices: [
          DownloadSourceFrom.SONGS_GIST,
          DownloadSourceFrom.PLAYLISTS_GIST,
          DownloadSourceFrom.SONG_URL,
          DownloadSourceFrom.PLAYLIST_URL,
        ],
        demandOption: true,
      })
      .option("urlSourceToDownload", {
        alias: "url",
        type: "string",
        description: "URL of the source to download",
        demandOption: true,
      })
      .option("outputDir", {
        alias: "output",
        type: "string",
        description: "Directory to save downloaded files",
        default: process.env.OUTPUT_DIR,
      })
      .option("archiveFile", {
        alias: "archive",
        type: "string",
        description: "Path to the archive file to keep track of downloaded files",
        default: process.env.DOWNLOADS_ARCHIVE_PATH,
      })
      .strict()
      .help().argv as {
      downloadFrom: DownloadSourceFrom
      urlSourceToDownload: string
      outputDir: string
      archiveFile: string
    }

    this.downloadFrom = argv.downloadFrom
    this.urlSourceToDownload = argv.urlSourceToDownload
    this.outputDir = argv.outputDir
    this.archiveFile = argv.archiveFile
    this.ensureDirectoryExists(this.outputDir)
    this.ensureFile(this.archiveFile)
  }

  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true })
    }
  }

  private ensureFile(file: string): void {
    this.ensureDirectoryExists(file.substring(0, file.lastIndexOf("/")))
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "", { flag: "wx" })
    }
  }
}
