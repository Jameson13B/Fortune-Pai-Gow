import React, { useState } from "react"
import { Helmet } from "react-helmet"
import { QRCode } from "react-qr-code"

import styles from "./Board.module.css"
import { PlayerDashboard } from "./PlayerDashboard"
import { DraggableHand } from "./DraggableHand"
import { Card } from "./Card"
import { PAYOUTS, MIN_BET } from "./consts"

export const PaiGowBoard = ({
  G,
  playerID,
  tableCode,
  matchData,
  ctx,
  moves,
  events,
}) => {
  const seats = G.players
  const [showDealerHand, setShowDealerHand] = useState(false)
  const [dealerArrangedHand, setDealerArrangedHand] = useState([])

  const isEvaluateHandsPhase =
    ctx.activePlayers && ctx.activePlayers[0] === "evaluateHands"
  const isSetHandsPhase =
    ctx.activePlayers && ctx.activePlayers[0] === "setHands"
  const isBettingPhase = ctx.activePlayers && ctx.activePlayers[0] === "betting"

  if (playerID > "0") {
    return (
      <>
        <Helmet>
          <title>{`Fortune Pai Gow - ${
            matchData.find((p) => p.id === Number(playerID))?.name
          }`}</title>
        </Helmet>
        <PlayerDashboard
          playerID={playerID}
          G={G}
          ctx={ctx}
          moves={moves}
          events={events}
          matchData={matchData}
        />
      </>
    )
  }

  const handleBet = (seatIndex, type) => {
    if (ctx.activePlayers[seatIndex] !== "betting") return

    const [currentMainBet, currentBonusBet] = G.players[seatIndex].bet

    if (type === "main") {
      moves.bet(currentMainBet + 5, currentBonusBet, seatIndex)
    } else {
      moves.bet(currentMainBet, currentBonusBet + 5, seatIndex)
    }
  }

  const handleDealCards = () => moves.dealCards()
  const handleSetDealerHand = () => {
    const handToSet =
      dealerArrangedHand.length > 0 ? dealerArrangedHand : G.players[0].hand
    moves.setHand(handToSet)
    events.endStage()
  }
  const handleRevealHand = () => setShowDealerHand(true)
  const handleClearBet = (seatIndex) => {
    if (ctx.activePlayers[seatIndex] !== "betting") return
    moves.bet(0, 0, seatIndex)
  }
  /**
   * Checks if all non-dealer players have completed the specified phase.
   * @param {object} ctx - The game context containing activePlayers.
   * @param {string} phase - The phase to check for (e.g., "betting", "setHands").
   * @returns {boolean} True if all non-dealer players are not in the specified phase.
   */
  const haveAllPlayersFinishedPhase = (ctx, phase) => {
    // Get all player IDs except dealer ("0")
    const playerIDs = Object.keys(ctx.activePlayers).filter((id) => id !== "0")
    // If there are no other players, consider as all finished
    if (playerIDs.length === 0) return true
    // If any are still in the phase, return false
    return playerIDs.every((id) => ctx.activePlayers[id] !== phase)
  }

  return (
    <div className={styles.paigowBoard}>
      <Helmet>
        <title>{`Fortune Pai Gow - Master`}</title>
      </Helmet>

      <div className={styles.tableFelt}>
        {/* Dealer Area */}
        <div className={styles.dealerArea}>
          <h3>DEALER</h3>
          {isBettingPhase && (
            <button
              className={styles.dealerButton}
              disabled={!haveAllPlayersFinishedPhase(ctx, "betting")}
              onClick={handleDealCards}
            >
              DEAL CARDS
            </button>
          )}
          {isSetHandsPhase && !showDealerHand && (
            <button
              className={styles.dealerButton}
              disabled={!haveAllPlayersFinishedPhase(ctx, "setHands")}
              onClick={handleRevealHand}
            >
              REVEAL HAND
            </button>
          )}
          {isSetHandsPhase && showDealerHand && (
            <button
              className={styles.dealerButton}
              style={{
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                margin: 0,
              }}
              onClick={handleSetDealerHand}
            >
              CONFIRM HAND
            </button>
          )}

          {isEvaluateHandsPhase && (
            <button
              className={styles.dealerButton}
              disabled={!haveAllPlayersFinishedPhase(ctx, "evaluateHands")}
              onClick={() => {
                moves.startNextHand()
                setShowDealerHand(false)
                setDealerArrangedHand([])
              }}
            >
              Next Hand
            </button>
          )}
        </div>

        {/* Table Info */}
        <div className={styles.tableInfo}>
          <strong className={styles.tableTitle}>TABLE INFO</strong>
          <div className={styles.tableInfoContainer}>
            <div style={{ opacity: 0.8 }}>
              <QRCode
                value={`${window.location.origin}/join?tableCode=${tableCode}`}
                bgColor="transparent"
                fgColor="#ffd700"
                size={80}
              />
            </div>
            <div>
              <p className={styles.tableCode}>
                <span>Tbl Code:</span> <span>{tableCode}</span>
              </p>
              <p className={styles.tableCode}>
                <span>Min Bet:</span> <span>${MIN_BET}</span>
              </p>
              <p className={styles.tableCode}>
                <span>Phase:</span>{" "}
                <span>{ctx.activePlayers[0].toUpperCase()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payout Chart */}
        <div className={styles.payoutChart}>
          <strong className={styles.tableTitle}>FORTUNE BONUS</strong>
          {PAYOUTS.map((p, i) => (
            <div key={i}>
              <span style={{ textAlign: "left", width: "60%" }}>{p.hand}</span>
              <span style={{ textAlign: "center", width: "25%" }}>{p.pay}</span>
              {p.envy && (
                <span style={{ textAlign: "center", width: "15%" }}>
                  {p.envy}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Center Dealer Hand */}
        {showDealerHand && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60%",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%", height: "150px" }}>
              <DraggableHand
                player={G.players[0]}
                hand={G.players[0].hand}
                onHandChange={setDealerArrangedHand}
              />
            </div>
          </div>
        )}

        {/* Player Seats */}
        {seats.slice(1).map((player, index) => {
          // Calculate position dynamically
          const totalPlayers = seats.length - 1
          const radiusX = 36 // percent of container width
          const radiusY = 38 // percent of container height
          const centerX = 50
          const centerY = 40 // Slightly above center to leave room at bottom

          let angleDeg
          let step = 0
          let startAngle = 90

          if (totalPlayers === 1) {
            angleDeg = 90
          } else {
            // Distribute centered around 90 degrees (bottom)
            // Span depends on number of players to avoid crowding or too much spread
            // Max spread for 6 players: 180 degrees (wraps more around the table)
            const maxSpan = 180
            // Increase angle per player to fill the space better
            const span = Math.min(maxSpan, (totalPlayers - 1) * 35)
            startAngle = 90 - span / 2
            step = span / Math.max(1, totalPlayers - 1)
            angleDeg = startAngle + index * step
          }

          const angleRad = (angleDeg * Math.PI) / 180
          const left = centerX + radiusX * Math.cos(angleRad)
          const top = centerY + radiusY * Math.sin(angleRad)
          const matchDataPlayer = matchData?.find(
            (player) => Number(player.id) === index + 1
          )

          const seatID = index + 1 // Actual player ID in G.players

          return (
            <React.Fragment key={index}>
              <div
                className={styles.playerSeat}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  // Shift to center the element on its point
                  transform: `translate(-50%, -50%) rotate(${
                    angleDeg - 90
                  }deg)`,
                }}
              >
                <div className={styles.bettingArea}>
                  <div
                    className={styles.bonusBetSpot}
                    onClick={() => handleBet(seatID, "bonus")}
                    style={{
                      cursor: "pointer",
                      outlined: `4px solid ${
                        player.outcome?.[2] == 1
                          ? "lime"
                          : player.outcome?.[2] == -1
                          ? "orangered"
                          : "transparent"
                      }`,
                    }}
                  >
                    {player.bet[1] > 0 && (
                      <div className={styles.bonusChip}>{player.bet[1]}</div>
                    )}
                  </div>
                  <div
                    className={styles.mainBetCircle}
                    onClick={() => handleBet(seatID, "main")}
                    style={{ cursor: "pointer" }}
                  >
                    {player.bet[0] > 0 && (
                      <div className={styles.mainChip}>{player.bet[0]}</div>
                    )}
                  </div>
                </div>
                <div
                  className={styles.playerInfo}
                  onClick={() => handleClearBet(seatID)}
                >
                  {matchDataPlayer?.name || `Seat ${seatID} - Open`}
                  <div style={{ fontSize: "0.8em", color: "#ffd700" }}>
                    {player.bank}
                  </div>
                </div>
                {player.outcome ? (
                  <div
                    className={styles.revealedHands}
                    style={{
                      marginTop: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {/* Small Hand */}
                    <div
                      style={{
                        position: "relative",
                        height: 50,
                        width: 75,
                        marginBottom: 5,
                      }}
                    >
                      {player.smallHand.map((c, i) => (
                        <Card
                          key={i}
                          card={c}
                          style={{
                            position: "absolute",
                            left: i * 45,
                            top: 0,
                            transform: "scale(0.7)",
                            transformOrigin: "top left",
                            border:
                              player.outcome[0] === 1
                                ? "4px solid lime"
                                : player.outcome[0] === -1
                                ? "4px solid orangered"
                                : "none",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                    </div>
                    {/* Big Hand */}
                    <div
                      style={{ position: "relative", height: 50, width: 185 }}
                    >
                      {player.bigHand.map((c, i) => (
                        <Card
                          key={i}
                          card={c}
                          style={{
                            position: "absolute",
                            left: i * 45,
                            top: -12,
                            transform: "scale(0.7)",
                            transformOrigin: "top left",
                            border:
                              player.outcome[1] === 1
                                ? "4px solid lime"
                                : player.outcome[1] === -1
                                ? "4px solid orangered"
                                : "none",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.playerLowPile}>
                      L{player.smallHand.length ? "✓" : ""}
                    </div>
                    <div className={styles.playerHighPile}>
                      H{player.bigHand.length ? "✓" : ""}
                    </div>
                  </>
                )}
              </div>
            </React.Fragment>
          )
        })}

        {/* Center Logo/Text */}
        <div
          style={{
            position: "absolute",
            opacity: 0.3,
            color: "#ffd700",
            fontSize: "3rem",
            fontWeight: "bold",
            fontFamily: "Gmhightop",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "100%",
            pointerEvents: "none", // Let clicks pass through
          }}
        >
          FORTUNE PAI GOW
          <span
            style={{
              display: "block",
              fontSize: "1.75rem",
              fontWeight: "bold",
              fontFamily: "MonteCarlo",
              lineHeight: "0.3em",
            }}
          >
            Neon Fiction Games
          </span>
        </div>
      </div>
    </div>
  )
}
