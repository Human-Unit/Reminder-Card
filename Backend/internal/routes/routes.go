package routes

import (
	handlers "Base/internal/handlers"

	"Base/internal/middleware"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRoutes(r *gin.Engine) {

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	dash := r.Group("/dashboard")
	dash.Use(middleware.AuthMiddleware())
	dash.GET("", func(c *gin.Context) {
		c.File("./site/dashboard.html")
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	User := r.Group("/user")

	User.POST("/entries", handlers.CreateEntry)
	User.POST("/logout", handlers.Logout)
	User.POST("/getusername", handlers.GetUsername)
	User.GET("/entries", handlers.GetEntries)
	User.POST("/create", handlers.CreateUser)
	User.POST("/login", handlers.Login)
	User.PUT("/entries/:id", handlers.UpdateEntry)
	User.DELETE("/entries/:id", handlers.DeleteEntry)

	Admin := r.Group("/admin")
	Admin.Use(middleware.AuthAdminMiddleware())
	Admin.GET("/entries", handlers.GetAllEntries)
	Admin.GET("/users", handlers.GetAllUsers)
	Admin.PUT("/entries/:id", handlers.UpdateAnyEntry)
	Admin.DELETE("/entries/:id", handlers.DeleteAnyEntry)
	Admin.PUT("/users", handlers.UpdateUser)
	Admin.DELETE("/users", handlers.DeleteUser)
}
