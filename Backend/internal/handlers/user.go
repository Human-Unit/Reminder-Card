package handlers

import (
	"Base/internal/middleware"
	"Base/internal/models"
	"net/http"
	"os"

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

	// 1. Сначала проверяем на "Супер-админа" из ENV
	if input.Name == "admin" && input.Password == os.Getenv("ADMIN_PASSWORD") {
		role = "admin"
		// Пытаемся найти запись в БД для ID, но если не нашли — не страшно
		DB.Where("name = ?", "admin").First(&foundUser)
		if foundUser.ID == 0 {
			foundUser.ID = 999 // Временный ID для виртуального админа
			foundUser.Name = "admin"
		}
	} else {
		// 2. Если не админ, тогда идем в базу искать обычного юзера
		role = "user"
		if err := DB.Where("name = ?", input.Name).First(&foundUser).Error; err != nil {
			// Вот здесь "record not found" теперь уместен
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid name or password"})
			return
		}

		// 3. Проверяем bcrypt только для обычных юзеров
		err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(input.Password))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid name or password"})
			return
		}
	}

	// 4. Генерация токена (роль уже определена выше)
	usertoken, err := middleware.CreateToken(foundUser.ID, foundUser.Name, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token creation failed"})
		return
	}

	middleware.SetCookie(c, usertoken)
	// middleware.SetRoleCookie(c, role)
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
