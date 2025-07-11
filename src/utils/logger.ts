import { blueBright, greenBright, red, redBright, yellowBright } from "colorette"
import ora, { Ora } from "ora"
import { ErrorTypes } from "../downloader/types"

class Logger {
  #spinner: Ora | null = null
  #message: string = ""

  start(message: string) {
    if (this.#spinner?.isSpinning) {
      this.#spinner.stop()
    }

    this.#message = message
    this.#spinner = ora(message).start()
  }

  info(message: string) {
    if (this.#spinner?.isSpinning) {
      this.#spinner.info(blueBright(message))
    } else {
      console.info(blueBright(message))
    }
  }

  succeed(message?: string) {
    if (this.#spinner?.isSpinning) {
      this.#spinner.succeed(greenBright(message || this.#message))
      this.#spinner = null
    }
  }

  warn(message: string) {
    if (this.#spinner?.isSpinning) {
      this.#spinner.warn(yellowBright(message))
      this.#spinner = null
    } else {
      console.warn(yellowBright(message))
    }
  }

  fail(type: ErrorTypes, where: string, message?: string) {
    if (this.#spinner?.isSpinning) {
      this.#spinner.fail(
        `${red(this.#message)} \n ${redBright("ERROR TYPE:")} ${type} \n ${redBright(
          "WHERE:"
        )} ${where} \n ${redBright("DETAILS:")} ${message || this.#message}`
      )
      this.#spinner = null
    } else {
      console.error(
        `${red(this.#message)} \n ${redBright("ERROR TYPE:")} ${type} \n ${redBright(
          "WHERE:"
        )} ${where} \n ${redBright("DETAILS:")} ${message || this.#message}`
      )
    }
  }

  failAndPersist() {
    if (this.#spinner?.isSpinning) {
      this.#spinner.fail(this.#message)
      this.#spinner = null
    }
  }
}

const logger = new Logger()
export default logger
