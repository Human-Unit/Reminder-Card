package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name     string `gorm:"not null" json:"name"`
	Email    string `gorm:"unique;" json:"email"` // This creates constraint
	Password string `gorm:"not null" json:"password"`
}

type Entry struct {
	gorm.Model
	UserID    uint   `gorm:"not null" json:"User_id"`
	Situation string `gorm:"not null" json:"Situation"`
	Text      string `gorm:"not null" json:"Text"`
	Colour    string `gorm:"not null" json:"Colour"`
	Icon      string `gorm:"not null" json:"Icon"`
}
