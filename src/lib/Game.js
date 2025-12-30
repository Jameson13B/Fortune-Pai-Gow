import { compare, evaluateBonus, getFullDeck } from "./poker.js"

const ignoreMaster = {
  order: {
    first: () => 1,
    next: ({ ctx }) => {
      const nextPos = (ctx.playOrderPos + 1) % ctx.numPlayers
      // If next player is 0, skip to the one after
      return ctx.playOrder[nextPos] === "0"
        ? (nextPos + 1) % ctx.numPlayers
        : nextPos
    },
  },
}

export const PaiGowGame = {
  name: "fortune-paigow",

  setup,

  turn: {
    ...ignoreMaster,
    activePlayers: { all: "betting", min: 1, max: 1 },
    stages: {
      betting: {
        name: "betting",
        description: "Players place their bets",
        moves: { bet, dealCards },
      },
      setHands: {
        name: "setHands",
        description: "Players set their hands",
        moves: { setHand },
        min: 1,
        max: 1,
        next: "evaluateHands",
      },
      evaluateHands: {
        name: "evaluateHands",
        description: "Evaluate the their hands",
        moves: { evaluateHand, startNextHand },
        min: 1,
        max: 1,
      },
    },
  },
}

// Setup the initial game state
function setup({ ctx }) {
  return {
    players: Array.from({ length: ctx.numPlayers }, () => ({
      bank: 300,
      bet: [0, 0],
      hand: [],
      smallHand: [],
      bigHand: [],
      outcome: null,
    })),
    discardPile: [],
  }
}

function bet({ G }, mainBet, bonusBet, targetID) {
  const player = G.players[targetID]

  // Refund existing bet so we can update it
  player.bank += player.bet[0] + player.bet[1]

  player.bank -= mainBet + bonusBet
  player.bet[0] = mainBet
  player.bet[1] = bonusBet
}

function dealCards({ events, random, ctx, G }) {
  // Get a full deck that is shuffled twice
  const deck = getFullDeck(random)
  G.discardPile = []

  // Distribute the cards to the players, cards for seats not occupied are discarded
  deck.forEach((card, index) => {
    const playerIndex = index % ctx.numPlayers

    playerIndex < ctx.numPlayers && G.players[playerIndex].hand.length < 7
      ? G.players[playerIndex].hand.push(card)
      : G.discardPile.push(card)
  })

  events.setActivePlayers({ all: "setHands" })
}

// Set the hand of a player
function setHand({ G, playerID }, orderedHand) {
  G.players[playerID].smallHand = orderedHand.slice(0, 2)
  G.players[playerID].bigHand = orderedHand.slice(2)
}

// Compare the hand of a player with the dealer's hand
function evaluateHand({ G, playerID }) {
  const player = G.players[playerID]
  const bonus = evaluateBonus([...player.bigHand, ...player.smallHand])
  const smallHandWinner = compare(player.smallHand, G.players[0].smallHand)
  const bigHandWinner = compare(player.bigHand, G.players[0].bigHand)

  if (smallHandWinner === "player" && bigHandWinner === "player") {
    player.outcome = [1, 1] // Player wins both hands
    player.bank += player.bet[0] // Add the main bet to the player's bank
  } else if (smallHandWinner === "dealer" && bigHandWinner === "dealer") {
    player.outcome = [-1, -1] // Dealer wins both hands
    player.bet[0] = 0 // Reset main bet
  } else {
    // Player wins one hand, its a tie
    player.outcome = [
      smallHandWinner === "player" ? 1 : -1,
      bigHandWinner === "player" ? 1 : -1,
    ]
  }

  if (bonus) {
    const bonusBet = player.bet[1]
    const bonusPayout = parseInt(bonus.pay.split(":")[0])

    player.bank += bonusBet * bonusPayout
    player.outcome.push(1)
  } else {
    player.bet[1] = 0 // Reset bonus bet
    player.outcome.push(-1)
  }
}

// Start the next game
function startNextHand({ events, G }) {
  events.setActivePlayers({ all: "betting" })
  G.discardPile = []
  G.players.forEach((player) => {
    player.hand = []
    player.smallHand = []
    player.bigHand = []
    player.outcome = null
  })
}
