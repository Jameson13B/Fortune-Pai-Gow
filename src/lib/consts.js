export const MIN_BET = 15

export const Suits = ["S", "C", "D", "H"]

export const JOKER = "JOKER"

export const Ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
]

export const PAYOUTS = [
  { hand: "HAND", pay: "PAYOUT", envy: "ENVY" },
  { hand: "7 Card Straight Flush", pay: "5000:1", envy: "5000" },
  { hand: "Royal Flush + Match", pay: "2000:1", envy: "1000" },
  { hand: "7 Card SF w/ Joker", pay: "1000:1", envy: "500" },
  { hand: "5 Aces", pay: "400:1", envy: "250" },
  { hand: "Royal Flush", pay: "150:1", envy: "50" },
  { hand: "Straight Flush", pay: "50:1", envy: "25" },
  { hand: "4 of a Kind", pay: "25:1", envy: "5" },
  { hand: "Full House", pay: "5:1", envy: "-" },
  { hand: "Flush", pay: "4:1", envy: "-" },
  { hand: "3 of a Kind", pay: "3:1", envy: "-" },
  { hand: "Straight", pay: "2:1", envy: "-" },
]
