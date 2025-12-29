import { JOKER, PAYOUTS, Ranks, Suits } from "./consts.js"

export const getFullDeck = (random) => {
  let deck = [{ suit: JOKER, rank: JOKER }]

  for (let suit of Suits) {
    for (let rank of Ranks) {
      deck.push({ suit: suit, rank: rank })
    }
  }

  return random.Shuffle(random.Shuffle(deck))
}

const rankToValue = {}
Ranks.forEach((r, i) => {
  rankToValue[r] = i + 2
})

const getCardValue = (card) => {
  if (card.rank === JOKER) return 14
  return rankToValue[card.rank]
}

const isFlush = (hand) => {
  if (hand.length < 5) return false
  const nonJokers = hand.filter((c) => c.rank !== JOKER)
  if (nonJokers.length === 0) return true
  const suit = nonJokers[0].suit
  return nonJokers.every((c) => c.suit === suit)
}

const getStraightRank = (hand) => {
  if (hand.length < 5) return 0

  const hasJoker = hand.some((c) => c.rank === JOKER)
  const nonJokers = hand.filter((c) => c.rank !== JOKER)
  const values = Array.from(new Set(nonJokers.map(getCardValue))).sort(
    (a, b) => b - a
  )

  if (!hasJoker) {
    if (values.length !== 5) return 0
    if (values[0] - values[4] === 4) return values[0]
    // Wheel (A-2-3-4-5)
    if (
      values[0] === 14 &&
      values[1] === 5 &&
      values[2] === 4 &&
      values[3] === 3 &&
      values[4] === 2
    )
      return 5
    return 0
  }

  // Joker Logic
  if (values.length !== 4) return 0 // Needs 4 distinct non-jokers

  // Normal
  const gap = values[0] - values[3]
  if (gap <= 4) {
    if (gap === 3 && values[0] < 14) return values[0] + 1
    return values[0]
  }

  // Wheel Check (A treated as 1)
  const wheelValues = values
    .map((v) => (v === 14 ? 1 : v))
    .sort((a, b) => b - a)
  if (wheelValues[0] <= 5 && wheelValues[0] - wheelValues[3] <= 4) {
    return 5
  }

  return 0
}

// Returns object with count of each rank: { 14: 1, 10: 2, ... }
const getRankCounts = (hand) => {
  const counts = {}
  hand.forEach((card) => {
    const val = getCardValue(card)
    counts[val] = (counts[val] || 0) + 1
  })
  return counts
}

export const evaluate = (hand) => {
  // Sort descending
  const sorted = [...hand].sort((a, b) => getCardValue(b) - getCardValue(a))
  const values = sorted.map(getCardValue)

  const flush = isFlush(sorted)
  const straightRank = getStraightRank(sorted)
  const straight = straightRank > 0

  // Counts
  const counts = getRankCounts(sorted)
  const countValues = Object.values(counts)

  // 5 of a kind
  if (countValues.includes(5)) {
    return { tier: 9, kickers: [14] }
  }

  // Identify groups
  // 4 of a kind
  if (countValues.includes(4)) {
    const fourVal = parseInt(Object.keys(counts).find((k) => counts[k] === 4))
    const kicker = parseInt(Object.keys(counts).find((k) => counts[k] === 1))
    return { tier: 7, kickers: [fourVal, kicker] }
  }

  // Full House
  if (countValues.includes(3) && countValues.includes(2)) {
    const threeVal = parseInt(Object.keys(counts).find((k) => counts[k] === 3))
    const twoVal = parseInt(Object.keys(counts).find((k) => counts[k] === 2))
    return { tier: 6, kickers: [threeVal, twoVal] }
  }

  // Straight Flush (includes Royal)
  if (straight && flush) {
    return { tier: 8, kickers: [straightRank] }
  }

  // Flush
  if (flush) {
    return { tier: 5, kickers: values }
  }

  // Straight
  if (straight) {
    return { tier: 4, kickers: [straightRank] }
  }

  // Three of a Kind
  if (countValues.includes(3)) {
    const threeVal = parseInt(Object.keys(counts).find((k) => counts[k] === 3))
    const kickers = values.filter((v) => v !== threeVal)
    return { tier: 3, kickers: [threeVal, ...kickers] }
  }

  // Two Pair
  if (countValues.filter((c) => c === 2).length === 2) {
    const pairs = Object.keys(counts)
      .filter((k) => counts[k] === 2)
      .map(Number)
      .sort((a, b) => b - a)
    const kicker = Object.keys(counts).find((k) => counts[k] === 1)
    return { tier: 2, kickers: [...pairs, Number(kicker)] }
  }

  // One Pair
  if (countValues.includes(2)) {
    const pairVal = parseInt(Object.keys(counts).find((k) => counts[k] === 2))
    const kickers = values.filter((v) => v !== pairVal)
    return { tier: 1, kickers: [pairVal, ...kickers] }
  }

  // High Card
  return { tier: 0, kickers: values }
}

export const compare = (hand1, hand2) => {
  const e1 = evaluate(hand1)
  const e2 = evaluate(hand2)

  if (e1.tier > e2.tier) return "player"
  if (e2.tier > e1.tier) return "dealer"

  // Same tier, compare kickers
  for (let i = 0; i < e1.kickers.length; i++) {
    if (e1.kickers[i] > e2.kickers[i]) return "player"
    if (e2.kickers[i] > e1.kickers[i]) return "dealer"
  }

  return "draw" // Tie
}

const getCombinations = (arr, k) => {
  if (k === 0) return [[]]
  if (arr.length === 0) return []
  const [first, ...rest] = arr
  const withFirst = getCombinations(rest, k - 1).map((c) => [first, ...c])
  const withoutFirst = getCombinations(rest, k)
  return [...withFirst, ...withoutFirst]
}

const getSplits = (hand) => {
  const results = []
  const indices = [0, 1, 2, 3, 4, 5, 6]
  const indexCombos = getCombinations(indices, 5)

  for (const comboIndices of indexCombos) {
    const hand5 = comboIndices.map((i) => hand[i])
    const hand2 = hand.filter((_, i) => !comboIndices.includes(i))
    results.push({ hand5, hand2 })
  }
  return results
}

const isRoyalMatch = (cards) => {
  if (cards.length !== 2) return false
  const [c1, c2] = cards

  // Need K and Q of same suit
  // Handle Joker
  const r1 = c1.rank
  const r2 = c2.rank
  const s1 = c1.suit
  const s2 = c2.suit

  // If one is Joker
  if (r1 === JOKER) {
    // Other must be K or Q
    return r2 === "K" || r2 === "Q"
  }
  if (r2 === JOKER) {
    return r1 === "K" || r1 === "Q"
  }

  // No Joker
  if (s1 !== s2) return false
  return (r1 === "K" && r2 === "Q") || (r1 === "Q" && r2 === "K")
}

// Returns string type or null
const check7CardStraightFlush = (hand) => {
  const hasJoker = hand.some((c) => c.rank === JOKER)
  const nonJokers = hand.filter((c) => c.rank !== JOKER)

  if (nonJokers.length === 0) return null
  const suit = nonJokers[0].suit
  if (!nonJokers.every((c) => c.suit === suit)) return null

  const values = nonJokers.map(getCardValue).sort((a, b) => a - b)
  const uniqueValues = Array.from(new Set(values))

  let isStraight = false

  if (hasJoker) {
    // 6 cards + Joker.
    // Check if uniqueValues fit in range of 7 (max - min <= 6)
    // AND distinct count check?
    // Since it's a flush in single deck, all cards must be distinct ranks anyway.

    // Normal case (A=14)
    if (uniqueValues[uniqueValues.length - 1] - uniqueValues[0] <= 6) {
      isStraight = true
    }
    // Wheel case (A=1)
    if (!isStraight && uniqueValues.includes(14)) {
      const lowAceValues = uniqueValues
        .map((v) => (v === 14 ? 1 : v))
        .sort((a, b) => a - b)
      if (lowAceValues[lowAceValues.length - 1] - lowAceValues[0] <= 6) {
        isStraight = true
      }
    }

    if (isStraight) return "7 Card SF w/ Joker"
  } else {
    // 7 cards no Joker
    if (uniqueValues.length !== 7) return null // Should be 7 distinct for single deck flush

    // Normal
    if (uniqueValues[6] - uniqueValues[0] === 6) isStraight = true
    // Wheel
    if (!isStraight && uniqueValues.includes(14)) {
      const lowAceValues = uniqueValues
        .map((v) => (v === 14 ? 1 : v))
        .sort((a, b) => a - b)
      if (lowAceValues[6] - lowAceValues[0] === 6) isStraight = true
    }

    if (isStraight) return "7 Card Straight Flush"
  }
  return null
}

export const evaluateBonus = (hand) => {
  if (!hand || hand.length !== 7) return null

  // 1. 7 Card Straight Flush Checks
  const sevenCardType = check7CardStraightFlush(hand)
  if (sevenCardType === "7 Card Straight Flush")
    return PAYOUTS.find((p) => p.hand === "7 Card Straight Flush")
  // Check RF + RM before Joker SF (higher payout)

  // 2. Royal Flush + Royal Match
  const splits = getSplits(hand)
  let hasRFplusRM = false

  for (const { hand5, hand2 } of splits) {
    const e = evaluate(hand5)
    // Royal Flush is Tier 8 with Ace high (14)
    if (e.tier === 8 && e.kickers[0] === 14) {
      if (isRoyalMatch(hand2)) {
        hasRFplusRM = true
        break
      }
    }
  }

  if (hasRFplusRM)
    return PAYOUTS.find((p) => p.hand === "Royal Flush + Royal Match")

  if (sevenCardType === "7 Card SF w/ Joker")
    return PAYOUTS.find((p) => p.hand === "7 Card SF w/ Joker")

  // 3. 5 Aces
  // Count Aces + Joker
  let aceCount = hand.filter((c) => c.rank === "A").length
  let jokerCount = hand.filter((c) => c.rank === JOKER).length
  if (aceCount + jokerCount >= 5) {
    // Ensure it's 4 Aces + Joker
    if (aceCount === 4 && jokerCount === 1) {
      return PAYOUTS.find((p) => p.hand === "5 Aces")
    }
  }

  // 4. Best 5-card Hand
  let bestPayoutIndex = 999

  // Iterate all splits to find best payout
  for (const { hand5 } of splits) {
    const e = evaluate(hand5)
    let name = null

    if (e.tier === 9) {
      name = "4 of a Kind"
    } else if (e.tier === 8) {
      if (e.kickers[0] === 14) name = "Royal Flush"
      else name = "Straight Flush"
    } else if (e.tier === 7) name = "4 of a Kind"
    else if (e.tier === 6) name = "Full House"
    else if (e.tier === 5) name = "Flush"
    else if (e.tier === 4) name = "Straight"
    else if (e.tier === 3) name = "3 of a Kind"

    if (name) {
      const pIndex = PAYOUTS.findIndex((p) => p.hand === name)
      if (pIndex !== -1 && pIndex < bestPayoutIndex) {
        bestPayoutIndex = pIndex
      }
    }
  }

  if (bestPayoutIndex !== 999) return PAYOUTS[bestPayoutIndex]

  return null
}
