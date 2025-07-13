import { execSync } from "child_process"
import { DEPENDENCIES_REQUIRED, ENVIRONMENT_VARIABLES_REQUIRED } from "../config"
import { ErrorTypes } from "../types/errors"
import logger from "./logger"

export class AppInitializer {
  constructor() {
    this.checkEnvironmentVars(ENVIRONMENT_VARIABLES_REQUIRED)
    this.checkDependencies(DEPENDENCIES_REQUIRED)
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
}
