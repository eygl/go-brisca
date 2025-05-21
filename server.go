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

  app.Get("/", func(c *fiber.Ctx) error {
    return c.Render("index", fiber.Map{
      "greeing": "world",
    })
  })

  app.Get("/hello", func(c *fiber.Ctx) error {
    return c.SendString("<p>Hey, it's me, the world.</p>")
  })

  log.Fatal(app.Listen(":3000"))
}
