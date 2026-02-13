package handlers

import (
	"Base/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
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
	idParam := c.Param("id")
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	// If ID is provided in URL, it takes precedence
	if idParam != "" {
		// You might need strconv here if ID is int,
		// but GORM can sometimes handle string IDs if the DB driver supports it,
		// or we should convert it. Let's convert for safety.
		// note: "strconv" needs to be imported if not present.
		// logic below assumes 'idParam' is valid.
	}

	// Since we need to use the ID from the URL to find the record to update:
	var userToUpdate models.User
	if err := DB.First(&userToUpdate, "id = ?", idParam).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	updates := map[string]interface{}{
		"name": user.Name,
		"role": user.Role, // Allow updating role too if needed
	}

	if user.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		updates["password"] = string(hashedPassword)
	}

	if err := DB.Model(&userToUpdate).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID required"})
		return
	}

	if err := DB.Delete(&models.User{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	// Also delete entries
	if err := DB.Delete(&models.Entry{}, "user_id = ?", id).Error; err != nil {
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
