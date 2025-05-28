package main

import (
  "fmt"
  "log"
  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/template/django/v3"
)


type Lobby struct {
    LobbyID     int64
    CreatedDate string
    Player1     string
    Player2     string
    Player3     string
    Player4     string
    Status      string 
}


func main() {
  lobbies := []Lobby{
    {
      LobbyID:     1,
      CreatedDate: "2025-05-27",
      Player1:     "Alice",
      Player2:     "Bob",
      Player3:     "",
      Player4:     "",
      Status:      "open",
    },
    {
      LobbyID:     2,
      CreatedDate: "2025-05-26",
      Player1:     "Eve",
      Player2:     "Frank",
      Player3:     "Grace",
      Player4:     "Heidi",
      Status:      "in-progress",
    },
    {
      LobbyID:     3,
      CreatedDate: "2025-05-25",
      Player1:     "Ivan",
      Player2:     "Judy",
      Player3:     "Mallory",
      Player4:     "Niaj",
      Status:      "completed",
    },
  }

  fmt.Println("Starting server...")
  engine := django.New("./templates", ".django")
  app := fiber.New(fiber.Config{
    Views: engine,
  })

  app.Static("/", "./static")
  app.Get("/", renderIndex)
  app.Post("/home", renderHome)
  app.Get("/lobbies", func(c *fiber.Ctx) error {
    return renderLobbies(c, lobbies)
  })

  log.Fatal(app.Listen(":3000"))
}
