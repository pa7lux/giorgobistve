# Giorgobistve

A Vue Ionic application for displaying Georgian songs with English translations. Named after the Georgian month "Giorgobistve" (გიორგობისთვე), which is traditionally associated with festivities and celebrations.

## Features
- Display Georgian songs with English translations
- Easy tab navigation between languages
- Responsive design for both mobile and desktop
- Clean, modern UI with Ionic components
- Markdown-based song storage for easy maintenance

## Setup
1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
ionic serve
```

## Adding New Songs
Place new song files in the `public/lyrics` directory using the following format:
```markdown
# Song Title

## Georgian
[Georgian lyrics here]

## English
[English translation here]
```

Then add the filename to `public/lyrics/index.json`.

## Technologies Used
- Vue.js 3
- Ionic Framework
- Markdown-it (for parsing markdown files)
