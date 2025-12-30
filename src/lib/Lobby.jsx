import { useState, useRef } from "react"
import { LobbyClient } from "boardgame.io/client"
import styles from "./Lobby.module.css"

const server = window.location.origin

export const Lobby = ({ setPlayer, setTableCode, setRole, role }) => {
  const [joinMatchID, setJoinMatchID] = useState(
    window.location.search.split("tableCode=")[1] || ""
  )
  const [joinPlayerName, setJoinPlayerName] = useState("")
  const lobbyClient = useRef(new LobbyClient({ server }))

  const handleCreateGame = (e) =>
    lobbyClient.current
      .createMatch("fortune-paigow", {
        numPlayers: Number(e.target.name) + 1,
        unlisted: true,
      })
      .then(({ matchID }) =>
        lobbyClient.current
          .joinMatch("fortune-paigow", matchID, {
            playerName: "Master",
            playerID: "0",
          })
          .then(({ playerCredentials, playerID }) => {
            lobbyClient.current.updatePlayer("fortune-paigow", matchID, {
              newName: "Master",
              playerID: "0",
              credentials: playerCredentials,
            })
            sessionStorage.setItem("paigow_matchID", matchID)
            sessionStorage.setItem("paigow_playerID", "0")
            sessionStorage.setItem(
              "paigow_playerCredentials",
              playerCredentials
            )
            sessionStorage.setItem("paigow_playerName", "Master")
            setPlayer({ playerID, playerCredentials, playerName: "Master" })
            setTableCode(matchID)
          })
      )

  const handleJoinGame = (e) => {
    e.preventDefault()
    lobbyClient.current
      .joinMatch("fortune-paigow", joinMatchID, { playerName: joinPlayerName })
      .then(({ playerCredentials, playerID }) => {
        lobbyClient.current.updatePlayer("fortune-paigow", joinMatchID, {
          newName: joinPlayerName,
          playerID: playerID,
          credentials: playerCredentials,
        })
        sessionStorage.setItem("paigow_matchID", joinMatchID)
        sessionStorage.setItem("paigow_playerID", playerID)
        sessionStorage.setItem("paigow_playerCredentials", playerCredentials)
        sessionStorage.setItem("paigow_playerName", joinPlayerName)
        setPlayer({ playerID, playerCredentials, playerName: joinPlayerName })
        setTableCode(joinMatchID)
      })
  }

  if (role === "master") {
    return (
      <div className={styles.lobbyContainer}>
        <h1 className={styles.title}>Fortune Pai Gow</h1>
        <div className={styles.formGroup}>
          <label htmlFor="numPlayers" className={styles.label}>
            Number of Players
          </label>
          <button className={styles.button} name="1" onClick={handleCreateGame}>
            1
          </button>
          <button className={styles.button} name="2" onClick={handleCreateGame}>
            2
          </button>
          <button className={styles.button} name="3" onClick={handleCreateGame}>
            3
          </button>
          <button className={styles.button} name="4" onClick={handleCreateGame}>
            4
          </button>
          <button className={styles.button} name="5" onClick={handleCreateGame}>
            5
          </button>
          <button className={styles.button} name="6" onClick={handleCreateGame}>
            6
          </button>
        </div>
      </div>
    )
  } else if (role === "player") {
    return (
      <form className={styles.lobbyContainer} onSubmit={handleJoinGame}>
        <h1 className={styles.title}>Fortune Pai Gow</h1>
        <div className={styles.formGroup}>
          <label htmlFor="matchID" className={styles.label}>
            Match ID
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder="Match ID"
            id="matchID"
            value={joinMatchID}
            onChange={(e) => setJoinMatchID(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="playerName" className={styles.label}>
            Player Name
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder="Player Name"
            id="playerName"
            value={joinPlayerName}
            onChange={(e) => setJoinPlayerName(e.target.value)}
          />
        </div>
        <button className={styles.button} type="submit">
          Join Game
        </button>
      </form>
    )
  }
  return (
    <div className={styles.lobbyContainer}>
      <h1 className={styles.title}>Fortune Pai Gow</h1>
      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={() => setRole("master")}>
          Create Game
        </button>
        <button className={styles.button} onClick={() => setRole("player")}>
          Join Game
        </button>
      </div>
    </div>
  )
}
