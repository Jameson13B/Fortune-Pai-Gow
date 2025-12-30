import { Server, Origins } from "boardgame.io/dist/cjs/server.js"
import path from "path"
import { fileURLToPath } from "url"
import serve from "koa-static"
import process from "process"
import { PaiGowGame } from "./Game.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const server = Server({
  games: [PaiGowGame],

  origins: [
    "https://paigow.neonfiction.games",
    "https://fortune-pai-gow-d86ff7aa74be.herokuapp.com/",
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
})
const PORT = process.env.PORT || 8000

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, "../../dist")
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT, () => {
  server.app.use(
    async (ctx, next) =>
      await serve(frontEndAppBuildPath)(
        Object.assign(ctx, { path: "index.html" }),
        next
      )
  )
  console.log(`Server is running on port ${PORT}`)
})
