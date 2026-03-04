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
	"golang.org/x/crypto/bcrypt"
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

	// Seed admin user if ADMIN_PASSWORD is set and no admin exists
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword != "" {
		var adminUser models.User
		if err := db.Where("role = ?", "admin").First(&adminUser).Error; err != nil {
			importBcryptPassword, _ := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
			adminUser = models.User{
				Name:     "admin",
				Email:    "admin@example.com",
				Password: string(importBcryptPassword),
				Role:     "admin",
			}
			db.Create(&adminUser)
			log.Println("Admin user seeded successfully.")
		} else if adminUser.Name != "admin" {
			// Just in case existing admin has different name
			adminUser.Name = "admin"
			db.Save(&adminUser)
		}
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

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	router.Use(gin.Recovery())
	routes.SetupRoutes(router)

	// Use standard PORT environment variable which Render defaults to
	port := os.Getenv("PORT")
	if port == "" {
		port = os.Getenv("Server_Port") // Keep backward compatibility with our own custom setting if PORT is not present
		if port == "" {
			port = "8080"
		}
		log.Printf("PORT not set, defaulting to %s", port)
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
