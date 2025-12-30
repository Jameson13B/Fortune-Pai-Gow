import { useState, useEffect } from "react"
import { Client } from "boardgame.io/react"
import { SocketIO } from "boardgame.io/multiplayer"

import "./App.css"
import { Lobby } from "./lib/Lobby"
import { PaiGowGame } from "./lib/Game"
import { PaiGowBoard } from "./lib/Board"

const server = window.location.origin

const PaiGowClient = Client({
  game: PaiGowGame,
  board: PaiGowBoard,
  multiplayer: SocketIO({ server }),
})

function App() {
  const [player, setPlayer] = useState(null)
  const [role, setRole] = useState(
    window.location.pathname === "/join" ? "player" : null
  )
  const [tableCode, setTableCode] = useState("")

  useEffect(() => {
    const savedMatchID = sessionStorage.getItem("paigow_matchID")
    const savedPlayerID = sessionStorage.getItem("paigow_playerID")
    const savedCredentials = sessionStorage.getItem("paigow_playerCredentials")
    const savedPlayerName = sessionStorage.getItem("paigow_playerName")

    if (savedMatchID && savedPlayerID && savedCredentials && savedPlayerName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTableCode(savedMatchID)
      setPlayer({
        playerID: savedPlayerID,
        playerCredentials: savedCredentials,
        playerName: savedPlayerName,
      })
    }
  }, [])

  const handleLeave = () => {
    sessionStorage.removeItem("paigow_matchID")
    sessionStorage.removeItem("paigow_playerID")
    sessionStorage.removeItem("paigow_playerCredentials")
    sessionStorage.removeItem("paigow_playerName")
    setPlayer(null)
    setTableCode("")
  }

  if (player && tableCode) {
    return (
      <div className="game-wrapper">
        <button className="leave-button" onClick={handleLeave}>
          Leave
        </button>
        <PaiGowClient
          playerID={player.playerID}
          tableCode={tableCode}
          matchID={tableCode}
          credentials={player.playerCredentials}
        />
      </div>
    )
  }

  return (
    <>
      <Lobby
        setPlayer={setPlayer}
        setRole={setRole}
        setTableCode={setTableCode}
        role={role}
      />
    </>
  )
}

export default App
