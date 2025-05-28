package main

import (
  "fmt"

  "github.com/gofiber/fiber/v2"
)

func renderIndex(c *fiber.Ctx) error {
  return c.Render("index", fiber.Map{})
} 

func renderLobbies(c *fiber.Ctx, players []Player, lobbies []Lobby) error {
  html := `<div class="lobby-holder">`
  for _, lobby := range lobbies {
    count := 0
    if len(lobby.Player1) > 0 { count += 1}
    if len(lobby.Player2) > 0 { count += 1}
    if len(lobby.Player3) > 0 { count += 1}
    if len(lobby.Player4) > 0 { count += 1}

    html += fmt.Sprintf(`
      <div class="lobby-card lobby-%s">
        <h2>Room %d</h2>
        <p>Status: %s</p>
        <p>Players: %d/4</p>
    `, lobby.Status, lobby.LobbyID, lobby.Status, count)

    if lobby.Status == "completed" {
      html += `
      </div>
      `
    } else {
      html += `
        <button>Join</button>
      </div>
      `
    }
  }
  html += "</div>"
  html += fmt.Sprintf("<p>Number of players online: %d</p>",len(players))
  return c.SendString(html)
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
      <div id="lobbies" class="lobbies" hx-get="/lobbies" hx-target="this" hx-swap="innerHTML" hx-trigger="load, every 3s"></div>
      <button>Create Lobby</button>
  `, username)
  return c.SendString(html)
}
