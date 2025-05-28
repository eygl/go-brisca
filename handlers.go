package main

import (
  "fmt"

  "github.com/gofiber/fiber/v2"
)

func renderIndex(c *fiber.Ctx) error {
  return c.Render("index", fiber.Map{})
} 

func renderLobbies(c *fiber.Ctx, lobbies []Lobby) error {
  html := ""
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
        <button>Join</button>
      </div>
    `, lobby.Status, lobby.LobbyID, lobby.Status, count)

    

  }
  return c.SendString(html)
}

func renderHome(c *fiber.Ctx) error {
  username := c.FormValue("username")
  uuid := c.FormValue("uuid")
  fmt.Printf("New Login: %s (%s)\n", username, uuid)
  html:= fmt.Sprintf(`
      <h2>Welcome %s</h2>
      <h2>Lobbies</h2>
      <div id="lobbies" hx-get="/lobbies" hx-target="this" hx-swap="innerHTML" hx-trigger="load, every 3s"></div>
      <button>Create Lobby</button>
  `, username)
  return c.SendString(html)
}
