import React, { useState, useEffect, useRef } from "react"
import styles from "./DraggableHand.module.css"
import { Card } from "./Card"

export const DraggableHand = ({ player, hand = [], onHandChange }) => {
  const [localHand, setLocalHand] = useState([])
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const handContainerRef = useRef(null)

  useEffect(() => {
    // Sync local hand with props.hand when it looks like a new hand or reset
    if (hand.length > 0 && localHand.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalHand([...hand])
    } else if (hand.length === 0 && localHand.length > 0) {
      setLocalHand([])
    }
  }, [hand, localHand.length])

  // Call onHandChange when localHand is set initially?
  // Maybe not. Only on user interaction is safer for now.
  // Actually, if the parent relies on onHandChange to know the current state to submit,
  // and the user NEVER moves a card, the parent might submit an empty or wrong list if it relies purely on callbacks.
  // Better pattern: Parent keeps source of truth or we expose a way to get it?
  // Or parent initializes its own state with `hand` and updates it via `onHandChange`.
  // Let's assume parent initializes "currentHand" = props.hand. And updates it when we call onHandChange.

  // Just in case, if localHand changes significantly (length), we might want to notify.
  // But let's stick to interaction updates.

  const getCardPosition = (index) => {
    // Layout: 2 cards (small), Gap, 5 cards (big)
    // Overlap: say 60px spacing (card is 100px wide)
    const cardSpacing = 75
    const gapSize = 55

    let left = index * cardSpacing
    if (index >= 2) {
      left += gapSize
    }

    return { left, top: 0, zIndex: index }
  }

  const handlePointerDown = (e, index) => {
    e.preventDefault()
    e.target.setPointerCapture(e.pointerId)
    setDraggingIndex(index)
    setDragOffset({ x: 0, y: 0 })

    const startX = e.clientX
    const startY = e.clientY

    const onPointerMove = (moveEvent) => {
      moveEvent.preventDefault()
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      setDragOffset({ x: dx, y: dy })
    }

    const onPointerUp = (upEvent) => {
      upEvent.preventDefault()
      e.target.releasePointerCapture(e.pointerId)

      // Calculate new position
      if (handContainerRef.current) {
        const container = handContainerRef.current
        const rect = container.getBoundingClientRect()
        const dropX = upEvent.clientX - rect.left

        const cardWidth = 100 // From CSS

        let closestIndex = index
        let minDist = Infinity

        for (let i = 0; i < localHand.length; i++) {
          const pos = getCardPosition(i)
          const centerX = pos.left + cardWidth / 2
          const dist = Math.abs(dropX - centerX)
          if (dist < minDist) {
            minDist = dist
            closestIndex = i
          }
        }

        if (closestIndex !== index) {
          const newHand = [...localHand]
          const [movedCard] = newHand.splice(index, 1)
          newHand.splice(closestIndex, 0, movedCard)
          setLocalHand(newHand)
          if (onHandChange) {
            onHandChange(newHand)
          }
        }
      }

      setDraggingIndex(null)
      setDragOffset({ x: 0, y: 0 })
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }

  // Calculate total width for container style
  const totalWidth =
    localHand.length > 0 ? getCardPosition(localHand.length - 1).left + 120 : 0

  if (localHand.length === 0) {
    return null
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "200px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background drop zones indicators */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: totalWidth,
          height: 180,
          display: "flex",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 60 * 1 + 130,
            border: `2px dashed ${
              player.outcome && player.outcome[0] === -1
                ? "crimson"
                : player.outcome && player.outcome[0] === 1
                ? "lime"
                : "rgba(255,255,255,0.2)"
            }`,
            borderRadius: 8,
            marginRight: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: 10,
          }}
        >
          <span
            style={{
              opacity: 0.3,
              color: "white",
            }}
          >
            SMALL (2)
          </span>
        </div>
        <div
          style={{
            flex: 1,
            border: `2px dashed ${
              player.outcome && player.outcome[1] === -1
                ? "crimson"
                : player.outcome && player.outcome[1] === 1
                ? "lime"
                : "rgba(255,255,255,0.2)"
            }`,
            borderRadius: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: 10,
          }}
        >
          <span
            style={{
              opacity: 0.3,
              color: "white",
            }}
          >
            BIG (5)
          </span>
        </div>
      </div>

      <div
        className={styles.handContainer}
        ref={handContainerRef}
        style={{ width: totalWidth, height: 160 }}
      >
        {localHand.map((card, index) => {
          const pos = getCardPosition(index)
          const isDragging = draggingIndex === index
          const smallHandOutcome = player.outcome?.[0] || null
          const bigHandOutcome = player.outcome?.[1] || null
          const style = {
            left: pos.left,
            top: pos.top,
            zIndex: isDragging ? 100 : pos.zIndex,
            transform: isDragging
              ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
              : "none",
            opacity:
              smallHandOutcome === -1 && index < 2
                ? 0.5
                : bigHandOutcome === -1 && index >= 2
                ? 0.5
                : 1,
          }

          return (
            <Card
              key={`${card.rank}-${card.suit}-${index}`}
              card={card}
              index={index}
              isDragging={isDragging}
              onPointerDown={handlePointerDown}
              style={style}
            />
          )
        })}
      </div>
    </div>
  )
}
