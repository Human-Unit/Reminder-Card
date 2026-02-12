package handlers

import (
	"Base/internal/middleware"
	"Base/internal/models"
	"net/http"
	"os"

	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Регистрация
func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format"})
		return
	}

	if user.Name == "" || user.Email == "" || user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}

	if err := DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User already exists or DB error"})
		return
	}

	user.Password = "" // Скрываем пароль перед отправкой на фронт
	c.JSON(http.StatusCreated, user)
}

func Login(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var foundUser models.User
	var role string
	adminPass := os.Getenv("ADMIN_PASSWORD")

	// 1. "SUPER-ADMIN" Check (ENV Priority)
	// We check this first to ensure the ENV admin always has a way in.
	if strings.EqualFold(input.Name, "admin") && adminPass != "" && input.Password == adminPass {
		role = "admin"
		// Try to link to a DB record if it exists for the 'admin' name
		DB.Where("name = ?", "admin").First(&foundUser)
		if foundUser.ID == 0 {
			foundUser.ID = 999
			foundUser.Name = "admin"
		}
	} else {
		// 2. DATABASE SEARCH for Regular Users (or DB Admin)
		if err := DB.Where("name = ?", input.Name).First(&foundUser).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		// 3. SMART PASSWORD VERIFICATION
		// First check: Plain-text (helps if you manually typed '12345' in the DB)
		if input.Password == foundUser.Password {
			// Password matches exactly as plain text
		} else {
			// Second check: Bcrypt (for properly registered users)
			err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(input.Password))
			if err != nil {
				fmt.Printf("Auth failed for %s: Bcrypt and Plain-text mismatch\n", input.Name)
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid name or password"})
				return
			}
		}

		// Assign role from DB or default to "user"
		role = foundUser.Role
		if role == "" {
			role = "user"
		}
	}

	// 4. TOKEN CREATION
	usertoken, err := middleware.CreateToken(foundUser.ID, foundUser.Name, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// 5. SUCCESS
	middleware.SetCookie(c, usertoken)
	c.JSON(http.StatusOK, gin.H{
		"token":    usertoken,
		"username": foundUser.Name,
		"role":     role,
	})
}
func Logout(c *gin.Context) {
	// Устанавливаем куку с тем же именем, но сроком действия -1 (удаление)
	c.SetCookie("token", "", -1, "/", "localhost", false, true)
	c.SetCookie("role", "", -1, "/", "localhost", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// Получение текущего имени (Оптимизировано)
func GetUsername(c *gin.Context) {
	tokenString, err := c.Cookie("token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token"})
		return
	}

	username, err := middleware.GetUsernameFromToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"username": username})
}
