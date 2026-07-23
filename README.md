# Amruta Wade — Software Engineer Portfolio

A personal portfolio showcasing software engineering work with a focus on **Babylon.js** and interactive 3D on the web. The page background is a **live Babylon.js scene** (not a video or image), built with **TypeScript** and bundled with **Vite**.

🔗 GitHub: [github.com/amrutawade](https://github.com/amrutawade)

## Tech stack

- [Babylon.js](https://www.babylonjs.com/) (`@babylonjs/core`, tree-shaken imports)
- TypeScript (strict)
- Vite
- GitHub Actions → GitHub Pages

## Local development

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build locally
```

## Deploying to GitHub Pages

This repo ships with a workflow at `.github/workflows/deploy.yml` that builds the
site and publishes it to GitHub Pages automatically.

1. Push this project to a GitHub repo (e.g. `amrutawade/portfolio`):
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/amrutawade/portfolio.git
   git push -u origin main
   ```
2. In the repo on GitHub, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Every push to `main` will build and deploy. Your site will be live at
   `https://amrutawade.github.io/portfolio/`.

> The Vite `base` is set to `"./"` (relative), so the build works whether it's
> served from a project subpath (`/portfolio/`) or a custom domain root — no
> config changes needed.

## Customizing

- **Skills & projects**: edit the `skills` and `projects` arrays in `src/main.ts`.
- **Copy / text**: edit `index.html`.
- **3D scene**: edit `src/scene.ts` (shapes, colors, camera, motion).
- **Colors / theme**: edit the CSS variables at the top of `src/style.css`.
- **Contact email**: replace `hello@example.com` in `index.html`.
