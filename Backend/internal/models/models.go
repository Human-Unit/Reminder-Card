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
	gorm.Model
	UserID    uint   `gorm:"not null" json:"userId"`
	Situation string `gorm:"not null" json:"situation"`
	Text      string `gorm:"not null" json:"text"`
	Colour    string `gorm:"not null" json:"colour"`
	Icon      string `gorm:"not null" json:"icon"`
}
