# Personal Portfolio Website

A polished, single-page portfolio for CS students — built with vanilla HTML, CSS, and JavaScript. No build step required.

## Quick start

1. Open `index.html` in your browser (double-click or use Live Server in VS Code/Cursor).
2. Replace placeholder content with your information (see below).
3. Add your resume as `resume.pdf` in the project root.

## Customize your content

Search for these placeholders in `index.html`:

| Placeholder | Replace with |
|---|---|
| `Your Name` | Your full name |
| `YN` (nav logo) | Your initials |
| `your.email@uw.edu` | Your email |
| `yourusername` / `yourprofile` | GitHub & LinkedIn handles |
| Project titles, descriptions, links | Your actual projects |
| Experience timeline entries | Your jobs, internships, TA roles |
| Skills tags | Technologies you know |

Also update the `<title>` and `<meta description>` in the `<head>`.

## Deploy for free

### GitHub Pages

1. Create a new GitHub repository.
2. Push this folder to the repo.
3. Go to **Settings → Pages → Source** and select your main branch.
4. Your site will be live at `https://yourusername.github.io/repo-name/`.

### Netlify

Drag and drop the folder onto [netlify.com/drop](https://app.netlify.com/drop).

## File structure

```
├── index.html      # Page content & structure
├── css/
│   └── styles.css  # Design system & layout
├── js/
│   └── main.js     # Nav, animations, interactions
├── resume.pdf      # Your resume (add this)
└── README.md
```

## Design notes

- **Typography**: Instrument Serif (headings), DM Sans (body), JetBrains Mono (code accents)
- **Theme**: Warm dark editorial with amber accents — distinctive without being flashy
- **Features**: Terminal hero, scroll reveals, rotating tagline, responsive mobile nav

## Optional enhancements

- Add project screenshots to `assets/` and include `<img>` tags in project cards
- Connect a custom domain through GitHub Pages or Netlify
- Add Google Analytics or Plausible for visitor tracking
- Convert to React/Vite later if you want a component-based setup
