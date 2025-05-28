package main

import (
  "fmt"
  "log"
  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/template/django/v3"
)

func main() {
  fmt.Println("Starting server...")
  engine := django.New("./templates", ".django")
  app := fiber.New(fiber.Config{
    Views: engine,
  })

  app.Static("/", "./static")

  app.Get("/", renderIndex)
  app.Post("/home", renderHome)
  app.Get("/lobbies", renderLobbies)

  log.Fatal(app.Listen(":3000"))
}
