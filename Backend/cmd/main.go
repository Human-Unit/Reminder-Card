package main

import (
	_ "Base/docs" // Make sure this path is correct
	database "Base/internal/database"
	"Base/internal/handlers"
	"Base/internal/models"
	"Base/internal/routes"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	godoenv "github.com/joho/godotenv"
)

// @title           Portfolio API
// @version         1.0
// @description     A REST API for user management
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.basic  BasicAuth
func main() {
	err := godoenv.Load()
	if err != nil {
		log.Printf("Note: .env file not found, using system environment variables")
	}

	log.Println("Initializing database connection...")
	db, err := database.DBConnect()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Set the database connection in handlers package
	handlers.SetDB(db)

	// Auto-migrate database models to create tables
	if err := db.AutoMigrate(&models.User{}, &models.Entry{}); err != nil {
		log.Fatal("Failed to auto-migrate database:", err)
	}

	// Test database connection
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get SQL DB:", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Test the connection
	if err := sqlDB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Initialize Gin router
	router := gin.Default()

	// Initialize Gin router

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	router.Use(gin.Recovery())
	routes.SetupRoutes(router)

	port := os.Getenv("Server_Port")
	if port == "" {
		port = "8080"
		log.Printf("Server_Port not set, defaulting to %s", port)
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
