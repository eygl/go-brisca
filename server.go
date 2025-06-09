package main

import (
  "fmt"
  "log"
  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/template/django/v3"
	"github.com/gofiber/contrib/websocket"
)


type Lobby struct {
  LobbyID     int64
  Name        string
  Creator     string
  CreatorUUID string
  CreatedDate string
  Player1     string
  Player2     string
  Player3     string
  Player4     string
  Status      string 
}

type Player struct {
  Username    string
  UUID        string
  Lobby       int64
}


func main() {
  players := []Player{}
  lobbies := []Lobby{ }

  fmt.Println("Starting server...")
  engine := django.New("./templates", ".django")
  app := fiber.New(fiber.Config{
    Views: engine,
  })

  //Config
  app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
  app.Static("/", "./static")

  //HTTP
  app.Get("/", renderIndex)
  app.Post("/home", func(c *fiber.Ctx) error {
    return renderHome(c, &players)
  })

  app.Post("/create/lobby", func(c *fiber.Ctx) error {
    return lobbyRoom(c, &lobbies)
  })

  //WS
  app.Get("/ws/lobbies", websocket.New(func(c *websocket.Conn) {
    defer c.Close()
    fmt.Println("New socket connection!")

		var err error

		for {
      html := renderLobbies(players, lobbies)

			if err = c.WriteMessage(websocket.TextMessage, []byte(html)); err != nil {
				log.Println("write:", err)
				break
			}
		}
  }))

  // app.Get("/ws/lobby/")

  log.Fatal(app.Listen("0.0.0.0:3000"))
}


