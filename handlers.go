package main

import (
  "fmt"
  "math/rand"
  "time"

  "github.com/gofiber/fiber/v2"
)

func renderIndex(c *fiber.Ctx) error {
  return c.Render("index", fiber.Map{})
} 

func renderHome(c *fiber.Ctx, players *[]Player) error {
  username := c.FormValue("username")
  uuid := c.FormValue("uuid")
  fmt.Println(players)

  playerSignedIn := false  
  for _, player := range *players {
    if uuid == player.UUID {
      playerSignedIn = true
    }
  }
  if !playerSignedIn {
    fmt.Printf("New Login: %s (%s)\n", username, uuid)
    player := Player{Username:username, UUID:uuid, Lobby:0,}
    *players = append(*players, player)   
  }
  html:= fmt.Sprintf(`
      <h2>Welcome %s!</h2>
      <h2>Lobbies</h2>
      <button hx-post="/create/lobby" hx-swap="none">+ Lobby</button>
      <div id="lobbies" class="lobbies" hx-ext="ws" ws-connect="/ws/lobbies" ws-send>
        <div id="lobby-holder"></div>
      </div>
  `, username)
  return c.SendString(html)
}

func lobbyRoom(c *fiber.Ctx, lobbies *[]Lobby) error {
  rand.Seed(time.Now().UnixNano())
  lobbyID := rand.Int63()
  fmt.Println("New Lobby ID:", lobbyID)
  lobby := Lobby{
    LobbyID:lobbyID,
    Name:"Fun Lobby",
    Creator:"Erick",
    CreatorUUID:"ADMIN",
    CreatedDate:"01-01-2025",
    Player1:"",
    Player2:"",
    Player3:"",
    Player4:"",
    Status:"waiting",
  }
  *lobbies = append(*lobbies, lobby)
  // return c.Render("lobby", fiber.Map{})
  return c.SendString("")
}

func renderLobbies(players []Player, lobbies []Lobby) string {
  html := `<div hx-swap-oob="innerHTML:#lobbies" class="lobbies">`
  if len(lobbies) == 0 {
    html += `<h2>No Lobbies. Create a new!</h2>` 
  } else {
    html += `<div class="lobby-holder">`
    for _, lobby := range lobbies {
      count := 0
      if len(lobby.Player1) > 0 { count += 1}
      if len(lobby.Player2) > 0 { count += 1}
      if len(lobby.Player3) > 0 { count += 1}
      if len(lobby.Player4) > 0 { count += 1}
       html += fmt.Sprintf(`
        <div class="lobby-card lobby-%s">
          <h2>%s</h2>
          <h4>%d</h4>
          <p>Status: %s</p>
          <p>Players: %d/4</p>
      `, lobby.Status, lobby.Name, lobby.LobbyID, lobby.Status, count)
       if lobby.Status == "completed" {
        html += `
        </div>
        `
      } else {
        html += fmt.Sprintf(`<button> Join</button></div>`, lobby.LobbyID) 
      }
    }
  }



  html += fmt.Sprintf("<p>Number of players online: %d</p>",len(players))
  html += "</div>"
  return html
}

