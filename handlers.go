package main

import (
  "fmt"

  "github.com/gofiber/fiber/v2"
)

func renderIndex(c *fiber.Ctx) error {
  return c.Render("index", fiber.Map{})
} 

func renderLobbies(c *fiber.Ctx) error {
  html := `
  <div class="lobby-card lobby-open">
    <h2>Room 1</h2>
    <p>Status: Open</p>
    <p>Players: 1/4</p>
    <button>Join</button>
  </div>
  <div class="lobby-card lobby-in-progress">
    <h2>Room 2</h2>
    <p>Status: In Progress</p>
    <p>Players: 4/4</p>
    <button>Join</button>
  </div>
  `
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
