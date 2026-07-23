import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";

// Side-effect imports required for the features used above.
import "@babylonjs/core/Rendering/edgesRenderer";
import "@babylonjs/core/Meshes/thinInstanceMesh";

interface FloatingNode {
  mesh: Mesh;
  spin: Vector3;
  bobPhase: number;
  bobAmp: number;
  baseY: number;
}

/**
 * Creates and runs the live Babylon.js background scene.
 * Returns a disposer so callers can tear it down if needed.
 */
export function createScene(canvas: HTMLCanvasElement): () => void {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    antialias: true,
  });
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 2));

  const scene = new Scene(engine);
  // Transparent clear color so the CSS gradient shows through the canvas.
  scene.clearColor = new Color4(0, 0, 0, 0);

  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2.2,
    Math.PI / 2.4,
    16,
    Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 10;
  camera.upperRadiusLimit = 26;
  camera.wheelDeltaPercentage = 0.01;
  camera.useAutoRotationBehavior = true;
  if (camera.autoRotationBehavior) {
    camera.autoRotationBehavior.idleRotationSpeed = 0.12;
    camera.autoRotationBehavior.idleRotationWaitTime = 1500;
  }

  const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.55;
  hemi.diffuse = new Color3(0.6, 0.7, 1.0);
  hemi.groundColor = new Color3(0.1, 0.1, 0.25);

  const key = new PointLight("key", new Vector3(6, 8, -6), scene);
  key.intensity = 0.9;
  key.diffuse = new Color3(0.4, 0.8, 1.0);

  const rim = new PointLight("rim", new Vector3(-8, -4, 6), scene);
  rim.intensity = 0.7;
  rim.diffuse = new Color3(0.9, 0.35, 0.9);

  const glow = new GlowLayer("glow", scene);
  glow.intensity = 0.6;

  // Palette for the floating nodes.
  const palette = [
    new Color3(0.35, 0.78, 1.0),
    new Color3(0.62, 0.51, 1.0),
    new Color3(0.98, 0.42, 0.79),
    new Color3(0.36, 0.94, 0.83),
  ];

  const nodes: FloatingNode[] = [];
  const rand = mulberry32(20240723);

  const makeMaterial = (color: Color3): StandardMaterial => {
    const mat = new StandardMaterial("mat", scene);
    mat.diffuseColor = color.scale(0.5);
    mat.emissiveColor = color.scale(0.55);
    mat.specularColor = new Color3(1, 1, 1);
    mat.specularPower = 64;
    return mat;
  };

  // A central "core" polyhedron.
  const core = MeshBuilder.CreatePolyhedron("core", { type: 3, size: 2.2 }, scene);
  core.material = makeMaterial(palette[0]);
  core.enableEdgesRendering();
  core.edgesWidth = 6;
  core.edgesColor = new Color4(0.7, 0.9, 1, 0.9);
  nodes.push({ mesh: core, spin: new Vector3(0, 0.15, 0.05), bobPhase: 0, bobAmp: 0.4, baseY: 0 });

  // Orbiting satellites of varied shapes.
  const count = 9;
  for (let i = 0; i < count; i++) {
    const kind = i % 3;
    let mesh: Mesh;
    if (kind === 0) {
      mesh = MeshBuilder.CreateTorus("t" + i, { diameter: 1.6, thickness: 0.35, tessellation: 24 }, scene);
    } else if (kind === 1) {
      mesh = MeshBuilder.CreateIcoSphere("s" + i, { radius: 0.85, subdivisions: 2 }, scene);
    } else {
      mesh = MeshBuilder.CreateBox("b" + i, { size: 1.2 }, scene);
    }
    const color = palette[(i + 1) % palette.length];
    mesh.material = makeMaterial(color);

    const angle = (i / count) * Math.PI * 2;
    const radius = 6 + rand() * 3;
    const y = (rand() - 0.5) * 6;
    mesh.position = new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

    nodes.push({
      mesh,
      spin: new Vector3((rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6),
      bobPhase: rand() * Math.PI * 2,
      bobAmp: 0.4 + rand() * 0.8,
      baseY: y,
    });
  }

  let t = 0;
  scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 1000;
    t += dt;
    for (const n of nodes) {
      n.mesh.rotation.x += n.spin.x * dt;
      n.mesh.rotation.y += n.spin.y * dt;
      n.mesh.rotation.z += n.spin.z * dt;
      n.mesh.position.y = n.baseY + Math.sin(t + n.bobPhase) * n.bobAmp;
    }
  });

  engine.runRenderLoop(() => scene.render());

  const onResize = () => engine.resize();
  window.addEventListener("resize", onResize);

  // Pause rendering when the tab is hidden to save battery/CPU.
  const onVisibility = () => {
    if (document.hidden) {
      engine.stopRenderLoop();
    } else {
      engine.runRenderLoop(() => scene.render());
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    scene.dispose();
    engine.dispose();
  };
}

/** Small seeded PRNG so the layout is stable between reloads. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
