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
  app.Post("/home", func(c *fiber.Ctx) error {
    return renderHome(c, &players)
  })
  app.Get("/lobbies", func(c *fiber.Ctx) error {
    return renderLobbies(c, players, lobbies)
  })

  app.Use("/ws", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

  app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		// c.Locals is added to the *websocket.Conn
		log.Println(c.Locals("allowed"))  // true
		log.Println(c.Params("id"))       // 123
		log.Println(c.Query("v"))         // 1.0
		log.Println(c.Cookies("session")) // ""

		// websocket.Conn bindings https://pkg.go.dev/github.com/fasthttp/websocket?tab=doc#pkg-index
		var (
			mt  int
			msg []byte
			err error
		)
		for {
			if mt, msg, err = c.ReadMessage(); err != nil {
				log.Println("read:", err)
				break
			}
			log.Printf("recv: %s", msg)

			if err = c.WriteMessage(mt, msg); err != nil {
				log.Println("write:", err)
				break
			}
		}

	}))
  log.Fatal(app.Listen("0.0.0.0:3000"))
}
