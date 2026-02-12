import { Briefcase, Lightbulb, Heart, Book, Coffee, Music, Sun, Moon, Star, Zap } from 'lucide-react';
import React from 'react';

export const ICON_MAP: Record<string, React.ElementType> = {
    briefcase: Briefcase,
    idea: Lightbulb,
    heart: Heart,
    book: Book,
    coffee: Coffee,
    music: Music,
    sun: Sun,
    moon: Moon,
    star: Star,
    zap: Zap,
};

export const COLOR_MAP: Record<string, string> = {
    purple: 'bg-gradient-to-r from-blue-500 to-purple-600',
    orange: 'bg-gradient-to-r from-orange-400 to-red-500',
    blue: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    green: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    pink: 'bg-gradient-to-r from-pink-500 to-rose-500',
    yellow: 'bg-gradient-to-r from-yellow-400 to-orange-500',
};

// Helper struct for UI selection if needed
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
export const AVAILABLE_COLORS = Object.keys(COLOR_MAP);
