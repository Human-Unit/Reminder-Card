package handlers

import (
	"Base/internal/middleware"
	"Base/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var DB *gorm.DB

func SetDB(database *gorm.DB) {
	DB = database
}

// Создание записи (Оптимизировано: берем ID из токена сразу)
func CreateEntry(c *gin.Context) {
	tokenString, err := c.Cookie("token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID, err := middleware.GetUserIDFromToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	var entry models.Entry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}
	if entry.Situation == "" || entry.Text == "" || entry.Colour == "" || entry.Icon == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}

	entry.UserID = userID // Устанавливаем ID напрямую из токена

	if err := DB.Create(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save entry"})
		return
	}

	c.JSON(http.StatusCreated, entry)
}

// Получение записей (Исправлен синтаксис Where)
func GetEntries(c *gin.Context) {
	tokenString, err := c.Cookie("token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID, err := middleware.GetUserIDFromToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	var entries []models.Entry
	// Исправлено: GORM требует явного указания колонки user_id
	if err := DB.Where("user_id = ?", userID).Order("created_at desc").Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, entries)
}

// UpdateEntry обновляет существующую запись
func UpdateEntry(c *gin.Context) {
	id := c.Param("id")
	tokenString, _ := c.Cookie("token")
	userID, _ := middleware.GetUserIDFromToken(tokenString)

	var entry models.Entry
	// Проверяем, существует ли запись и принадлежит ли она пользователю
	if err := DB.Where("id = ? AND user_id = ?", id, userID).First(&entry).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found"})
		return
	}

	// Привязываем новые данные
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	DB.Save(&entry)
	c.JSON(http.StatusOK, entry)
}

// DeleteEntry удаляет запись
func DeleteEntry(c *gin.Context) {
	id := c.Param("id")
	tokenString, _ := c.Cookie("token")
	userID, _ := middleware.GetUserIDFromToken(tokenString)

	result := DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Entry{})

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found or unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
}
