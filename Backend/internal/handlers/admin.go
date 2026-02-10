package handlers

import (
	"Base/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAllUsers(c *gin.Context) {
	var users []models.User
	if err := DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}

	c.JSON(http.StatusOK, users)
}
func UpdateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}
	if user.ID == 0 || user.Name == "" || user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID, username, and password are required"})

		return
	}
	if err := DB.Model(&models.User{}).Where("id = ?", user.ID).Updates(models.User{Name: user.Name, Password: user.Password}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func DeleteUser(c *gin.Context) {
	var id int
	if err := c.ShouldBindJSON(&id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	if err := DB.Delete(&models.Entry{}, id).Where("user_id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user entries"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func GetAllEntries(c *gin.Context) {
	var entries []models.Entry
	if err := DB.Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, entries)
}

func UpdateAnyEntry(c *gin.Context) {
	id := c.Param("id")
	var entry models.Entry
	// Проверяем, существует ли запись и принадлежит ли она пользователю
	if err := DB.Where("id = ?", id).First(&entry).Error; err != nil {
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

func DeleteAnyEntry(c *gin.Context) {
	id := c.Param("id")
	result := DB.Where("id = ?", id).Delete(&models.Entry{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Entry deleted successfully"})
}
