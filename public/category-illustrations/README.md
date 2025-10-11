# Category Illustrations

This folder contains custom illustrations for game categories. To match the exact 3D isometric style from your reference image, follow these guidelines:

## File Naming Convention
- Use the exact category name but converted to lowercase with special characters replaced by underscores
- Examples:
  - "Science" → `science.svg` or `science.png`
  - "Premium Literature" → `premium_literature.svg`
  - "Anime 2" → `anime_2.svg`

## Design Requirements (Based on Reference Image)
- **Style**: 3D isometric illustrations
- **Colors**: Vibrant, cartoon-like colors
- **Background**: Transparent PNG or SVG
- **Size**: Recommended 200x200px minimum for crisp display
- **Theme**: Each illustration should clearly represent the category topic

## Category-Specific Illustration Ideas:

### Science 🧪
- 3D laboratory equipment (beakers, test tubes, microscope)
- Molecule structures floating around
- Isometric lab table with colorful chemicals

### History 📜
- 3D ancient monuments (pyramids, colosseum)
- Scrolls and historical artifacts
- Isometric timeline elements

### Geography 🌍
- 3D globe with continents
- Mountain ranges and rivers
- Isometric map elements

### Literature 📚
- Stack of 3D books
- Floating letters and quotes
- Isometric library scene

### Sports ⚽
- 3D sports equipment (ball, trophy, medals)
- Isometric stadium or field
- Athletic gear in 3D style

### Anime 🎌
- 3D anime-style characters or symbols
- Japanese cultural elements (torii gate, cherry blossoms)
- Manga/anime aesthetic in isometric view

## Tools for Creating Illustrations:
1. **Blender** - For true 3D isometric renders
2. **Adobe Illustrator** - For vector-based isometric designs
3. **Figma** - For UI-friendly illustrations
4. **Canva** - For quick 3D-style graphics
5. **AI Tools** - DALL-E, Midjourney with "3D isometric" prompts

## Implementation:
1. Place your illustration files in this folder
2. Update the `illustrationMap` in `categories/page.tsx` if needed
3. The system will automatically use your custom illustrations when available
4. Falls back to emoji icons if no custom illustration is found

## Quality Checklist:
- ✅ Matches the 3D isometric style from reference
- ✅ High resolution (200x200px minimum)
- ✅ Transparent background
- ✅ Vibrant, engaging colors
- ✅ Clear representation of the category theme
- ✅ Consistent style across all illustrations