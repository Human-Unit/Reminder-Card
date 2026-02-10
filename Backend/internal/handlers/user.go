package handlers

import (
	"Base/internal/middleware"
	"Base/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
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

// Логин
func Login(c *gin.Context) {
	var input struct {
		Name     string `json:"name"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var foundUser models.User
	if err := DB.Where("name = ? AND password = ?", input.Name, input.Password).First(&foundUser).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid name or password"})
		return
	}

	usertoken, err := middleware.CreateToken(foundUser.ID, foundUser.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token creation failed"})
		return
	}

	middleware.SetCookie(c, usertoken)
	c.JSON(http.StatusOK, gin.H{
		"token":    usertoken,
		"username": foundUser.Name, // Для удобства фронта
	})
}

func Logout(c *gin.Context) {
	// Устанавливаем куку с тем же именем, но сроком действия -1 (удаление)
	c.SetCookie("token", "", -1, "/", "localhost", false, true)
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
