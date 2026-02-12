package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name     string `gorm:"not null" json:"name"`
	Email    string `gorm:"unique;" json:"email"`
	Password string `gorm:"not null" json:"password"`
	Role     string `gorm:"not null;default:'user'" json:"role"`
}

type Entry struct {
    ID        uint      `gorm:"primaryKey" json:"id"` // Explicitly 'id'
    Situation string    `json:"situation"`
    Text      string    `json:"text"`
    Icon      string    `json:"icon"`
    Colour    string    `json:"colour"`
    UserID    uint      `json:"user_id"`
}