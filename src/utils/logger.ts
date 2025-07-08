import { greenBright, red, redBright } from "colorette"
import ora, { Ora } from "ora"
import { ErrorType } from "../types"

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

  succeed(message?: string) {
    if (this.#spinner?.isSpinning) {
      this.#spinner.succeed(greenBright(message || this.#message))
      this.#spinner = null
    }
  }

  fail(type: ErrorType, where: string, message?: string) {
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
