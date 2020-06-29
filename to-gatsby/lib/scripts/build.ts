import { checkConfig } from "./check-config"
import { RuntimeJson } from "./types"
import * as execa from "execa"

const checkTypes = async () => {
  console.log("Checking typescript types...")

  await execa("yarn", ["run", "check-types"], {
    stderr: "inherit",
    stdout: "inherit",
    stdin: "inherit",
  })
}

// Building makes sure all necessary config items are provided, then runs gatsby build with all necessary environment variables.
export const build = async (shouldCheckConfig: boolean = true) => {
  if (shouldCheckConfig) {
    await checkConfig()
  }

  await checkTypes()

  await execa("yarn", ["run", "gatsby", "build"], {
    stderr: "inherit",
    stdout: "inherit",
    stdin: "inherit",
  })

  return
}