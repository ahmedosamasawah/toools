# أدوات نصية (Arabic Text Tools)

This repository contains a web application for working with Arabic text, providing various utilities for text cleaning, character analysis, text comparison, and Quran font rendering.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Components](#components)
- [UI Components](#ui-components)
- [Themes and Styling](#themes-and-styling)
- [Configuration Files](#configuration-files)
- [Build and Development](#build-and-development)

## Overview

The application is built using Svelte and TailwindCSS with a focus on Arabic typography and text processing. It provides a set of tools for working with Arabic text including text cleaning and normalization, character analysis, text comparison, and Quranic font rendering.

## Features

The application offers several key features across different tabs:

### Text Cleaner (تحسين النص)
- Text normalization and formatting
- Automatic replacement of common phrases with their symbolic representations
- Punctuation normalization and correction
- Whitespace management
- Diacritics handling

### Character Analysis (تحليل الحروف)
- Display detailed Unicode information for each character
- Character categorization
- Unicode codepoint display
- Copy characters to clipboard

### Text Comparison (مقارنة النصوص)
- Side-by-side text comparison
- Diff highlighting showing added, removed, and unchanged content
- Configuration options for comparison sensitivity

### Quran Fonts (خطوط القرآن)
- Support for multiple Quranic font styles
- Font preview with custom text
- Dynamic font loading

### Quick Copy Section
- Common symbols (﷽ﷺﷻ۝۞)
- Formatting marks (﴿﴾,«»,‹›,"",'',•,✽)
- Date formats in various Arabic calendar systems

## Getting Started

### Prerequisites

- Node.js
- pnpm (Package manager)

### Installation

1. Clone the repository
```bash
git clone https://github.com/nuqayah/toolsapp
cd toolsapp
```

2. Install dependencies
```bash
pnpm install
```

3. Start the development server
```bash
pnpm dev
```

The application will be available at http://localhost:5000 (or the port specified in the VITE_PORT environment variable).

## Project Structure

The project follows a standard Svelte application structure:

```
├── public/            # Static assets
├── src/               # Source code
│   ├── components/    # UI components
│   ├── css/           # CSS files
│   ├── lib/           # Library code
│   │   ├── components/ui/  # UI components from shadcn/svelte
│   │   ├── stores/         # Svelte stores
│   │   └── utils.js        # Utility functions
│   ├── util/          # Utility code
│   └── main.js        # Entry point
├── index.html         # HTML template
└── vite.config.js     # Vite configuration
```

## Components

The application consists of several main components:

### App.svelte
The main application component that handles the tab navigation and overall layout. It also includes the "Quick Copy" section for commonly used symbols.

### TextCleaner.svelte
Text cleaning and formatting tool with various options for Arabic text normalization.

### Unichar.svelte
Character analysis tool that displays information about each character in the input text.

### DiffViewer.svelte
Text comparison tool with highlighting to show differences between two texts.

### QuranFontRenderer.svelte
Tool for rendering text in different Quranic font styles.

### AdvancedSettingsMenu.svelte
A dropdown menu for application-wide settings including theme, text direction, and font size.

### Char.svelte
A component for displaying detailed information about a single character.

## UI Components

The application uses a component library based on shadcn/ui, adapted for Svelte. These components provide a consistent design system for the application.

Key UI components include:
- Button
- Card
- Dropdown Menu
- Input
- Tabs
- Textarea
- Switch
- Label
- ScrollArea

## Themes and Styling

The application uses TailwindCSS for styling, with custom CSS variables for theming. It supports both light and dark themes, and RTL (right-to-left) layout for Arabic text.

The main styles are defined in:
- `src/css/base.css` - Base styles and font definitions
- `src/css/tailwind.css` - TailwindCSS configuration and theme variables
- `tailwind.config.js` - TailwindCSS theme configuration

## Font Configuration

The application uses several Arabic fonts:

1. Kitab - A custom Arabic font for general text
2. Noto Naskh Arabic - A fallback font
3. QCF (Quran Complex Font) - For Quranic text rendering

Fonts are loaded dynamically based on user selection in the Quran Fonts section.

## Text Processing Utilities

The `src/util/replacements.js` file contains an extensive set of text normalization rules and replacements for Arabic text, including:

- Symbol replacements for common phrases (﷽, ﷺ, etc.)
- Punctuation normalization
- Bracket handling
- Whitespace management
- Diacritics positioning and cleaning

## Configuration Files

Key configuration files include:

- `vite.config.js` - Vite bundler configuration
- `tailwind.config.js` - TailwindCSS configuration
- `svelte.config.js` - Svelte configuration
- `eslint.config.js` - ESLint configuration
- `prettier.config.js` - Prettier configuration
- `components.json` - UI components configuration

## Build and Development

### Development Mode

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
```

## Technical Details

- The application is built with Svelte 5
- Styling is done using TailwindCSS 4
- UI components are adapted from the shadcn/ui library for Svelte
- The project uses Vite as the build tool
- ESLint and Prettier are configured for code formatting and linting
- Lefthook is used for Git hooks

## Browser Support

The application is designed to work with modern browsers, as specified in the browserslist configuration in package.json:

```
"browserslist": [
  "last 40 chrome version",
  "last 35 firefox version",
  "last 15 safari version"
]
```

## Special Considerations for Arabic Text

The project includes several features specifically designed for Arabic text:

- RTL (right-to-left) layout support
- Arabic font loading and configuration
- Arabic text normalization rules
- Support for Arabic punctuation
- Handling of Arabic diacritics and special characters
- Quranic text rendering
