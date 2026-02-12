package middleware

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// Use a function to get the key to ensure it's loaded from ENV correctly
func getSecretKey() []byte {
	return []byte(os.Getenv("SecretKey"))
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ExtractToken(c)
		if tokenString == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized: Missing token"})
			return
		}

		claims := &CustomClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return getSecretKey(), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token"})
			return
		}

		// CRITICAL: You must set these so your handlers can use them!
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}
func AuthAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ExtractToken(c)
		claims := &CustomClaims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return getSecretKey(), nil
		})

		if err != nil || !token.Valid || claims.Role != "admin" {
			c.AbortWithStatusJSON(403, gin.H{"error": "Forbidden: Admin access required"})
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}

// CreateToken builds a JWT containing user id and username
func CreateToken(userID uint, username string, role string) (string, error) {
	claims := CustomClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(getSecretKey())
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
func SetCookie(c *gin.Context, token string) {
	// Set secure to FALSE for localhost testing, otherwise it won't save
	c.SetCookie("token", token, 86400, "/", "", false, true)
}
func SetRoleCookie(c *gin.Context, role string) {
	c.SetCookie("role", role, 86400, "/", "", true, true)
}
func ExtractToken(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}
	t, _ := c.Cookie("token")
	return t
}

func GetUsernameFromToken(tokenString string) (string, error) {
	// Parse token with CustomClaims to extract username
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return getSecretKey(), nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims.Username, nil
	}
	return "", fmt.Errorf("invalid token")
}

// Define a custom claims structure
type CustomClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func GetUserIDFromToken(tokenString string) (uint, error) {
	// 1. Parse and validate the token with custom claims
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		// Return your secret key
		return getSecretKey(), nil
	})

	if err != nil {
		return 0, fmt.Errorf("failed to parse token: %w", err)
	}

	// 2. Extract claims
	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims.UserID, nil
	}

	return 0, fmt.Errorf("invalid token")
}
