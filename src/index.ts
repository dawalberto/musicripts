import { getVideoTitle } from "./modules/utils";

async function main() {
  try {
    const title = await getVideoTitle("https://www.youtube.com/watch?v=Okk4f58BU_Hbs");
    console.log("Video title:", title);
  } catch (error) {
    console.error("\n\x1b[1m❌ ERROR:\x1b[0m", error);
  }
}

main();
