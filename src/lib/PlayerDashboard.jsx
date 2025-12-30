import React, { useState, useEffect } from "react"
import styles from "./PlayerDashboard.module.css"
import { DraggableHand } from "./DraggableHand"

export const PlayerDashboard = ({
  playerID,
  G,
  ctx,
  moves,
  events,
  matchData,
}) => {
  const [localHand, setLocalHand] = useState([])

  // Sync local hand with G.players[playerID].hand when it changes
  useEffect(() => {
    const serverHand = G.players[playerID]?.hand || []
    if (serverHand.length === 0) {
      if (localHand.length > 0) {
        // Reset local hand if server hand is cleared
        setTimeout(() => setLocalHand([]), 0)
      }
    } else if (localHand.length === 0) {
      // Initialize local hand if empty and server hand has cards
      setTimeout(() => setLocalHand([...serverHand]), 0)
    }
  }, [G.players, playerID, localHand.length])

  const onSetHand = () => {
    if (localHand.length === 7) {
      moves.setHand(localHand)
      events.endStage()
    }
  }

  const isActive = ctx.activePlayers
    ? !!ctx.activePlayers[playerID]
    : ctx.currentPlayer === playerID
  const isBettingPhase =
    ctx.activePlayers && ctx.activePlayers[playerID] === "betting"
  const isEvaluateHandsPhase =
    ctx.activePlayers && ctx.activePlayers[playerID] === "evaluateHands"
  const isSetHandsPhase =
    ctx.activePlayers && ctx.activePlayers[playerID] === "setHands"
  const canSetHand = isActive && isSetHandsPhase && localHand.length === 7
  const matchDataPlayer = matchData?.find(
    (player) => Number(player.id) === Number(playerID)
  )

  return (
    <div className={styles.playerDashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.playerName}>
          {matchDataPlayer?.name || `Player ${playerID}`}
        </div>
        {/* {[1, -1, 0].includes(G.players[playerID].outcome) && (
          <div className={styles.gameStatus}>
            {G.players[playerID].outcome === 1
              ? "WON"
              : G.players[playerID].outcome === -1
              ? "LOST"
              : "TIE"}
          </div>
        )} */}
        <div className={styles.gameStatus}>
          {ctx.activePlayers && ctx.activePlayers[playerID].toUpperCase()}
        </div>
      </div>

      <div className={styles.dashboardMain}>
        {isBettingPhase ? (
          <div
            style={{
              color: "#ffd700",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            Please place your bet on the Master Board.
          </div>
        ) : localHand.length === 0 ? (
          <div className={styles.waitingMessage}>Waiting for deal...</div>
        ) : (
          <DraggableHand
            player={G.players[playerID]}
            hand={G.players[playerID].hand}
            onHandChange={setLocalHand}
          />
        )}
      </div>

      <div className={styles.actionBar}>
        {isSetHandsPhase && (
          <button
            className={styles.actionBtn}
            onClick={onSetHand}
            disabled={!canSetHand}
          >
            SET HAND
          </button>
        )}
        {isBettingPhase && (
          <button
            className={styles.actionBtn}
            onClick={() => events.endStage()}
            disabled={G.players[playerID].bet[0] === 0}
          >
            DONE BETTING
          </button>
        )}
        {isEvaluateHandsPhase && (
          <button
            className={styles.actionBtn}
            disabled={
              G.players[0].smallHand.length !== 2 &&
              G.players[0].bigHand.length !== 5
            }
            onClick={() => {
              moves.evaluateHand()
              events.endStage()
            }}
          >
            SHOW HANDS
          </button>
        )}
      </div>
    </div>
  )
}
