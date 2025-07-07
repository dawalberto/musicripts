import { getEssentialDataFromVideo } from "./modules/utils"

async function main() {
  try {
    const title = await getEssentialDataFromVideo("https://www.youtube.com/watch?v=O4f58BU_Hbs")
    //
  } catch (error) {
    console.error("\n\x1b[1m❌ ERROR:\x1b[0m", error)
  }
}

main()
