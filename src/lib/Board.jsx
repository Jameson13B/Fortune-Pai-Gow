import React, { useState } from "react"
import { Helmet } from "react-helmet"
import { QRCode } from "react-qr-code"

import "./Board.css"
import { PlayerDashboard } from "./PlayerDashboard"
import { DraggableHand } from "./DraggableHand"
import { Card } from "./Card"
import { PAYOUTS } from "./consts"

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
    <div className="paigow-board">
      <Helmet>
        <title>{`Fortune Pai Gow - Master`}</title>
      </Helmet>

      <div className="table-felt">
        {/* Dealer Area */}
        <div className="dealer-area">
          <h3>DEALER</h3>
          {isBettingPhase && (
            <button
              className="dealer-button"
              disabled={!haveAllPlayersFinishedPhase(ctx, "betting")}
              onClick={handleDealCards}
            >
              DEAL CARDS
            </button>
          )}
          {isSetHandsPhase && !showDealerHand && (
            <button
              className="dealer-button"
              disabled={!haveAllPlayersFinishedPhase(ctx, "setHands")}
              onClick={handleRevealHand}
            >
              REVEAL HAND
            </button>
          )}
          {isSetHandsPhase && showDealerHand && (
            <button
              className="dealer-button"
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
              className="dealer-button"
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

        <div className="join-code-container left">
          <p className="join-code-label">Join Here</p>
          <QRCode
            value={`${window.location.origin}/join?tableCode=${tableCode}`}
            bgColor="#35654d"
            fgColor="#ffd700"
            style={{
              width: "80px",
              height: "80px",
            }}
          />
        </div>
        <div className="join-code-container right">
          <p className="join-code-label">Join Here</p>
          <QRCode
            value={`${window.location.origin}/join?tableCode=${tableCode}`}
            bgColor="#35654d"
            fgColor="#ffd700"
            style={{
              width: "80px",
              height: "80px",
            }}
          />
        </div>
        {/* Payout Charts */}
        <p className="table-code left">TABLE - {tableCode}</p>
        <div className="payout-chart left">
          <strong
            style={{
              textAlign: "center",
              display: "block",
              fontSize: "0.9rem",
              fontFamily: "Gmhightop",
            }}
          >
            FORTUNE BONUS
          </strong>
          {PAYOUTS.map((p, i) => (
            <div key={i}>
              <span style={{ textAlign: "left", flexGrow: 1 }}>{p.hand}</span>
              <span style={{ textAlign: "left" }}>{p.pay}</span>
              {p.envy && <span style={{ textAlign: "right" }}>{p.envy}</span>}
            </div>
          ))}
        </div>
        <p className="table-code right">TABLE - {tableCode}</p>
        <div className="payout-chart right">
          <strong
            style={{
              textAlign: "center",
              display: "block",
              fontSize: "0.9rem",
              fontFamily: "Gmhightop",
            }}
          >
            FORTUNE BONUS
          </strong>
          {PAYOUTS.map((p, i) => (
            <div key={i}>
              <span style={{ textAlign: "left", flexGrow: 1 }}>{p.hand}</span>
              <span style={{ textAlign: "left" }}>{p.pay}</span>
              {p.envy && <span style={{ textAlign: "right" }}>{p.envy}</span>}
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
                className={`player-seat seat-${index}`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  // Shift to center the element on its point
                  transform: `translate(-50%, -50%) rotate(${
                    angleDeg - 90
                  }deg)`,
                }}
              >
                <div className="betting-area">
                  <div
                    className="bonus-bet-spot"
                    onClick={() => handleBet(seatID, "bonus")}
                    style={{
                      cursor: "pointer",
                      outline: `4px solid ${
                        player.outcome?.[2] == 1
                          ? "lime"
                          : player.outcome?.[2] == -1
                          ? "orangered"
                          : "transparent"
                      }`,
                    }}
                  >
                    {player.bet[1] > 0 && (
                      <div className="chip bonus-chip">{player.bet[1]}</div>
                    )}
                  </div>
                  <div
                    className="main-bet-circle"
                    onClick={() => handleBet(seatID, "main")}
                    style={{ cursor: "pointer" }}
                  >
                    {player.bet[0] > 0 && (
                      <div className="chip main-chip">{player.bet[0]}</div>
                    )}
                  </div>
                </div>
                <div
                  className="player-info"
                  onClick={() => handleClearBet(seatID)}
                >
                  {matchDataPlayer?.name || `Seat ${seatID} - Open`}
                  <div style={{ fontSize: "0.8em", color: "#ffd700" }}>
                    {player.bank}
                  </div>
                </div>
                {player.outcome ? (
                  <div
                    className="revealed-hands"
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
                    <div className="player-low-pile">
                      L{player.smallHand.length ? "✓" : ""}
                    </div>
                    <div className="player-high-pile">
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
            top: "35%",
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
