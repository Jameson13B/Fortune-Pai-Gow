import React from "react"
import styles from "./Card.module.css"
import { JOKER } from "./consts"

const SUIT_MAP = {
  S: { symbol: "♠", color: "black" },
  C: { symbol: "♣", color: "black" },
  D: { symbol: "♦", color: "red" },
  H: { symbol: "♥", color: "red" },
  [JOKER]: { symbol: "🃏", color: "purple" },
}

export const Card = ({ card, index, isDragging, onPointerDown, style, className }) => {
  const { rank, suit } = card
  const suitInfo = SUIT_MAP[suit] || { symbol: "?", color: "black" }

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.dragging : ""} ${className || ""}`}
      style={{
        ...style,
        color:
          suitInfo.color === "red"
            ? "#e74c3c"
            : suitInfo.color === "purple"
            ? "#9b59b6"
            : "#2c3e50",
      }}
      onPointerDown={(e) => onPointerDown && onPointerDown(e, index)}
    >
      <div className={styles.cardTop}>
        <span>{rank === JOKER ? "JK" : rank}</span>
        <span>{suitInfo.symbol}</span>
      </div>
      <div className={styles.cardCenter}>{suitInfo.symbol}</div>
      <div className={styles.cardBottom}>
        <span>{rank === JOKER ? "JK" : rank}</span>
        <span>{suitInfo.symbol}</span>
      </div>
    </div>
  )
}

