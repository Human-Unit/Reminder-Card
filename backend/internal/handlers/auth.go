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

// CreateUser registers a new user account.
func CreateUser(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email already taken (including soft-deleted users)
	var existing models.User
	err := DB.Unscoped().Where("email = ?", input.Email).First(&existing).Error
	
	if err == nil {
		// A record was found. Check if it's currently active (not soft-deleted)
		if existing.DeletedAt.Valid {
			// Record is soft-deleted. We can resurrect it!
			hashedPassword, hashErr := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
			if hashErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
				return
			}
			
			// Update the record with new details and clear the DeletedAt flag
			existing.Name = input.Name
			existing.Password = string(hashedPassword)
			existing.Role = "user"
			
			// Use Unscoped to update the soft-deleted record and clear DeletedAt
			if updateErr := DB.Unscoped().Model(&existing).Updates(map[string]interface{}{
				"name":       existing.Name,
				"password":   existing.Password,
				"role":       existing.Role,
				"deleted_at": nil,
			}).Error; updateErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore user"})
				return
			}
			c.JSON(http.StatusCreated, gin.H{"message": "User recreated successfully", "id": existing.ID})
			return
		}

		// Otherwise, it represents an active user. Block the registration.
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     "user",
	}

	if err := DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "id": user.ID})
}

// Login authenticates a user and returns a JWT token.
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Name     string `json:"name"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Support admin login by name, regular users by email
	var foundUser models.User
	if input.Name != "" {
		adminPassword := os.Getenv("ADMIN_PASSWORD")
		if adminPassword != "" && input.Password == adminPassword {
			if err := DB.Where("name = ? AND role = ?", input.Name, "admin").First(&foundUser).Error; err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
		} else {
			if err := DB.Where("name = ?", input.Name).First(&foundUser).Error; err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
			if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(input.Password)); err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}
		}
	} else if input.Email != "" {
		if err := DB.Where("email = ?", input.Email).First(&foundUser).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(input.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email or name required"})
		return
	}

	token, err := middleware.CreateToken(foundUser.ID, foundUser.Name, foundUser.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	middleware.SetCookie(c, token)
	middleware.SetRoleCookie(c, foundUser.Role)
	c.JSON(http.StatusOK, gin.H{"token": token, "role": foundUser.Role, "username": foundUser.Name})
}

// Logout clears the auth cookies.
func Logout(c *gin.Context) {
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.SetCookie("role", "", -1, "/", "", true, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetUsername returns the username for the current authenticated user.
func GetUsername(c *gin.Context) {
	tokenString := middleware.ExtractToken(c)
	if tokenString == "" {
		// Also try Authorization header with "Bearer " stripped already
		authHeader := c.GetHeader("Authorization")
		tokenString = strings.TrimPrefix(authHeader, "Bearer ")
	}
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	username, err := middleware.GetUsernameFromToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"username": username})
}
