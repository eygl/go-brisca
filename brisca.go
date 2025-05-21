package main

import (
  "fmt"
  "math/rand"
  "time"
)

const (
  Cups = "Cups"
  Coins = "Coins"
  Clubs = "Clubs"
  Swords = "Swords"
)

var ranks = []string {
  "1", "3", "King", "Knight", "Jack", "8", "7", "6", "5", "4", "2",
}

type Card struct {
  Suit   string
  Rank   string 
}

type Player struct {
  Name string
  Hand []Card
}

func newDeck() []Card {
  var deck []Card

  for _, suit := range []string{Cups, Coins, Clubs, Swords} {
    for _, rank := range ranks {
      deck = append(deck, Card{Rank: rank, Suit: suit})
    }
  }

  return deck
}

func shuffleDeck(deck []Card) {
  rand.Seed(time.Now().UnixNano())

  for i := len(deck) - 1; i > 0; i-- {
    j := rand.Intn(i + 1)
    deck[i], deck[j] = deck[j], deck[i]
  }
}

func printDeck(deck []Card) {
  for _, card := range deck {
    fmt.Println(card.Rank, "of", card.Suit)
  }
}

func dealCard(deck *[]Card) Card {
  card := (*deck)[0]
  *deck = (*deck)[1:]
  return card
}


func main() {
  fmt.Println("Welcome to Brisca!")
  fmt.Println()
  
  deck := newDeck()
  shuffleDeck(deck)
  trumpCard := dealCard(&deck)

  fmt.Println("Trump Card:", trumpCard.Rank, "of", trumpCard.Suit)

  playerCount := 2
  var players []Player
  //Create Players
  for i:= 0; i < playerCount; i++ {
    player := Player {
      Name: fmt.Sprintf("Player %d", i+1)
    }    
    players = append(players, player)
  }

  //Deal to players
  for i := 0; i < 3, j++ {
    for _, player := range players {

    }
  }
}
