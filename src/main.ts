import "./style.css";
import { createScene } from "./scene";

interface Skill {
  name: string;
  detail: string;
}

interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

const skills: Skill[] = [
  { name: "Babylon.js", detail: "Scenes, PBR materials, GLTF, animation, thin instances" },
  { name: "TypeScript", detail: "Strict, typed architecture for large 3D apps" },
  { name: "WebGL / WebGPU", detail: "Shaders, render pipelines, performance profiling" },
  { name: "Three.js", detail: "Comfortable across the 3D web ecosystem" },
  { name: "Vite / Bundling", detail: "Fast builds, code-splitting, tree-shaking" },
  { name: "GLSL", detail: "Custom vertex & fragment shaders" },
  { name: "Node.js", detail: "Tooling, asset pipelines, APIs" },
  { name: "UX & Accessibility", detail: "Reduced-motion, keyboard, responsive design" },
];

const projects: Project[] = [
  {
    title: "3D Product Configurator",
    description:
      "Real-time Babylon.js configurator with material swapping, camera framing, and shareable states.",
    tags: ["Babylon.js", "TypeScript", "PBR"],
    link: "https://github.com/amrutawade",
  },
  {
    title: "WebGL Scene Editor",
    description:
      "Node-based editor for composing lit 3D scenes in the browser with live GLSL shader editing.",
    tags: ["WebGL", "GLSL", "Vite"],
    link: "https://github.com/amrutawade",
  },
  {
    title: "Interactive Data Globe",
    description:
      "Performant instanced globe visualizing live datasets with smooth camera transitions.",
    tags: ["Babylon.js", "Thin Instances", "Data Viz"],
    link: "https://github.com/amrutawade",
  },
  {
    title: "Browser 3D Mini-Game",
    description:
      "Physics-driven arcade game running at 60fps, built to explore engine performance limits.",
    tags: ["Babylon.js", "Physics", "Game"],
    link: "https://github.com/amrutawade",
  },
];

function renderSkills(): void {
  const grid = document.getElementById("skills-grid");
  if (!grid) return;
  grid.innerHTML = skills
    .map(
      (s) => `
      <article class="skill">
        <h3>${s.name}</h3>
        <p>${s.detail}</p>
      </article>`
    )
    .join("");
}

function renderProjects(): void {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  grid.innerHTML = projects
    .map(
      (p) => `
      <a class="project" href="${p.link}" target="_blank" rel="noopener">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="project__tags">
          ${p.tags.map((t) => `<span>${t}</span>`).join("")}
        </div>
        <span class="project__arrow" aria-hidden="true">→</span>
      </a>`
    )
    .join("");
}

function setYear(): void {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function boot(): void {
  renderSkills();
  renderProjects();
  setYear();

  const canvas = document.getElementById("scene") as HTMLCanvasElement | null;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Respect reduced-motion: skip the animated WebGL background.
  if (canvas && !prefersReducedMotion) {
    try {
      createScene(canvas);
    } catch (err) {
      console.error("Failed to start Babylon scene:", err);
      canvas.style.display = "none";
    }
  } else if (canvas) {
    canvas.style.display = "none";
  }

  // Reveal-on-scroll for sections.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".section").forEach((s) => observer.observe(s));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
