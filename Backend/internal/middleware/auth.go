package middleware

import (
	"log"
	"os"

	"time"

	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

var secretKey []byte = []byte(os.Getenv("SecretKey"))

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Accept token from Authorization header (Bearer ...) or cookie as fallback
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			// cookie fallback
			var err error
			tokenString, err = c.Cookie("token")
			if err != nil || tokenString == "" {
				c.JSON(401, gin.H{"error": "Unauthorized: Missing token"})
				c.Abort()
				return
			}
		} else {
			const bearerPrefix = "Bearer "
			if len(tokenString) > len(bearerPrefix) && tokenString[:len(bearerPrefix)] == bearerPrefix {
				tokenString = tokenString[len(bearerPrefix):]
			}
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.NewValidationError("unexpected signing method", jwt.ValidationErrorSignatureInvalid)
			}
			return secretKey, nil
		})

		if err != nil || !token.Valid {
			log.Printf("Invalid token: %v", err)
			c.JSON(401, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// CreateToken builds a JWT containing user id and username
func CreateToken(userID uint, username string) (string, error) {
	claims := CustomClaims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
func SetCookie(c *gin.Context, token string) {
	c.SetCookie("token", token, 86400, "/", "", true, true)
}

func GetUsernameFromToken(tokenString string) (string, error) {
	// Parse token with CustomClaims to extract username
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return secretKey, nil
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
		return secretKey, nil
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
