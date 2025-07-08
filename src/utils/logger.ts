import { bold, greenBright, red, redBright } from "colorette"
import ora, { Ora } from "ora"
import { ErrorType } from "../types"

export class Logger {
  #spinner: Ora
  #message: string

  constructor(message: string) {
    this.#spinner = ora(message)
    this.#message = message
  }

  logLoading(message?: string) {
    this.#spinner.start(message || this.#message)
  }

  logSuccess(message?: string) {
    this.#spinner.succeed(greenBright(message || this.#message))
  }

  logError(type: ErrorType, where: string, message?: string) {
    this.#spinner.fail(
      `${bold(red("ERROR:"))} \n ${redBright("TYPE:")} ${type} \n ${redBright(
        "WHERE:"
      )} ${where} \n ${redBright("DETAILS:")} ${message || this.#message}`
    )
  }
}
