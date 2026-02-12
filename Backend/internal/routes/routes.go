package routes

import (
	handlers "Base/internal/handlers"

	"Base/internal/middleware"
	"time"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRoutes(r *gin.Engine) {
	// 1. IMPROVED CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 2. PUBLIC USER ROUTES (No Token Needed)
	public := r.Group("/user")
	{
		public.POST("/login", handlers.Login)
		public.POST("/create", handlers.CreateUser) // Registration
	}

	// 3. PROTECTED USER ROUTES (Token Needed!)
	// This is why regular users weren't getting data properly
	protectedUser := r.Group("/user")
	protectedUser.Use(middleware.AuthMiddleware())
	{
		protectedUser.POST("/logout", handlers.Logout)
		protectedUser.POST("/getusername", handlers.GetUsername)
		protectedUser.GET("/entries", handlers.GetEntries) // Now works because middleware sets UserID
		protectedUser.POST("/entries", handlers.CreateEntry)
		protectedUser.PUT("/entries/:id", handlers.UpdateEntry)
		protectedUser.DELETE("/entries/:id", handlers.DeleteEntry)
	}

	// 4. ADMIN ROUTES
	admin := r.Group("/admin")
	admin.Use(middleware.AuthAdminMiddleware())
	{
		admin.GET("/entries", handlers.GetAllEntries)
		admin.GET("/users", handlers.GetAllUsers)
		admin.PUT("/entries/:id", handlers.UpdateAnyEntry)
		admin.DELETE("/entries/:id", handlers.DeleteAnyEntry)
		admin.PUT("/users/:id", handlers.UpdateUser)
		admin.DELETE("/users/:id", handlers.DeleteUser)
	}

	// Swagger and Dash
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
