package handlers

import (
	"Base/internal/middleware"
	"Base/internal/models"
	"net/http"
	"os"

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

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

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
	var role string = "user"

	// 1. Check for Hardcoded Admin (Environment Variable)
	adminPass := os.Getenv("ADMIN_PASSWORD")
	if strings.EqualFold(input.Name, "admin") && adminPass != "" && input.Password == adminPass {
		role = "admin"
		// Ensure admin exists in DB for ID reference, or create a dummy one if needed for the token
		// Strategy: Try to find "admin" in DB. If not found, use a fixed ID (999).
		if err := DB.Where("name = ?", "admin").First(&foundUser).Error; err != nil {
			foundUser.ID = 999
			foundUser.Name = "admin"
		}
	} else {
		// 2. Regular Database Authentication
		if err := DB.Where("name = ?", input.Name).First(&foundUser).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Verify Password
		// Priority: Bcrypt check. Fallback: Plaintext (for legacy/testing data only)
		if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(input.Password)); err != nil {
			if foundUser.Password != input.Password {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
		}

		role = foundUser.Role
		if role == "" {
			role = "user"
		}
	}

	// 3. Generate Token
	token, err := middleware.CreateToken(foundUser.ID, foundUser.Name, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// 4. Set Cookie & Response
	middleware.SetCookie(c, token)
	c.JSON(http.StatusOK, gin.H{
		"token":    token,
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
	tokenString := middleware.ExtractToken(c)
	if tokenString == "" {
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
