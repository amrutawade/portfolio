import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import {
  Vector3,
  Color3,
  Color4,
} from "@babylonjs/core/Maths/math";
import { PointsCloudSystem } from "@babylonjs/core/Particles/pointsCloudSystem";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";

interface ParticleData {
  radius: number;
  angle: number;
  speed: number;
  phase: number;
  wave: number;
  baseY: number;
}

export function createScene(
  canvas: HTMLCanvasElement
): () => void {
  // =====================================================
  // ENGINE
  // =====================================================

  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    antialias: true,
  });

  engine.setHardwareScalingLevel(
    1 / Math.min(window.devicePixelRatio || 1, 2)
  );

  // =====================================================
  // SCENE
  // =====================================================

  const scene = new Scene(engine);

  scene.clearColor = new Color4(
    0,
    0,
    0,
    0
  );

  // =====================================================
  // CAMERA
  // =====================================================

  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.4,
    20,
    Vector3.Zero(),
    scene
  );

  camera.attachControl(
    canvas,
    true
  );

  camera.lowerRadiusLimit = 8;
  camera.upperRadiusLimit = 30;

  camera.wheelDeltaPercentage = 0.01;

  camera.useAutoRotationBehavior = true;

  if (camera.autoRotationBehavior) {
    camera.autoRotationBehavior.idleRotationSpeed = 0.08;
    camera.autoRotationBehavior.idleRotationWaitTime = 1500;
  }

  // =====================================================
  // POINT CLOUD MATERIAL
  // =====================================================

  const material =
    new StandardMaterial(
      "pointCloudMaterial",
      scene
    );

  material.pointsCloud = true;

  material.pointSize = 4;

  material.disableLighting = true;

  material.emissiveColor =
    new Color3(
      0.2,
      0.7,
      1
    );

  // =====================================================
  // GLOW
  // =====================================================

  const glow =
    new GlowLayer(
      "pointGlow",
      scene
    );

  glow.intensity = 0.8;

  // =====================================================
  // POINT CLOUD
  // =====================================================
  //
  // IMPORTANT:
  //
  // The second argument controls point size.
  //
  // 4 = clearly visible.
  //
  // =====================================================

  const pcs =
    new PointsCloudSystem(
      "portfolioCloud",
      4,
      scene
    );

  pcs.computeParticleRotation = false;

  pcs.computeParticleTexture = false;

  // =====================================================
  // RANDOM
  // =====================================================

  const random =
    mulberry32(20240723);

  // =====================================================
  // PARTICLE COUNT
  // =====================================================

  const PARTICLE_COUNT = 10000;

  // =====================================================
  // PARTICLE DATA
  // =====================================================

  const data: ParticleData[] =
    [];

  // =====================================================
  // CREATE POINTS
  // =====================================================
  //
  // We deliberately use `any` here because Babylon's
  // addPoints() callback is itself typed as `any` in the
  // current PointsCloudSystem API.
  //
  // This avoids importing the non-exported CloudPoint type.
  //
  // =====================================================

  pcs.addPoints(
    PARTICLE_COUNT,
    (particle: any, index: number) => {
      // -----------------------------------------------
      // DISTRIBUTION
      // -----------------------------------------------

      const stream =
        index % 4;

      let radius: number;

      let angle: number;

      // Central cloud
      if (stream === 0) {
        radius =
          Math.pow(
            random(),
            1.7
          ) * 4.5;

        angle =
          random() *
          Math.PI *
          2;
      }

      // Inner ring
      else if (stream === 1) {
        radius =
          4 +
          random() * 3;

        angle =
          random() *
          Math.PI *
          2;
      }

      // Outer ring
      else if (stream === 2) {
        radius =
          6 +
          random() * 3;

        angle =
          random() *
          Math.PI *
          2;
      }

      // Spiral
      else {
        radius =
          1 +
          random() * 8;

        angle =
          radius * 0.8 +
          random() *
            Math.PI *
            2;
      }

      // -----------------------------------------------
      // POSITION
      // -----------------------------------------------

      const x =
        Math.cos(angle) *
        radius;

      const z =
        Math.sin(angle) *
        radius;

      const y =
        (random() - 0.5) *
        3;

      particle.position =
        new Vector3(
          x,
          y,
          z
        );

      // -----------------------------------------------
      // COLOR
      // -----------------------------------------------

      const colorIndex =
        index % 4;

      if (colorIndex === 0) {
        particle.color =
          new Color4(
            0.1,
            0.8,
            1.0,
            1.0
          );
      } else if (
        colorIndex === 1
      ) {
        particle.color =
          new Color4(
            0.3,
            0.5,
            1.0,
            1.0
          );
      } else if (
        colorIndex === 2
      ) {
        particle.color =
          new Color4(
            0.7,
            0.3,
            1.0,
            1.0
          );
      } else {
        particle.color =
          new Color4(
            1.0,
            0.25,
            0.75,
            1.0
          );
      }

      // -----------------------------------------------
      // ANIMATION DATA
      // -----------------------------------------------

      data.push({
        radius,

        angle,

        speed:
          0.08 +
          random() * 0.2,

        phase:
          random() *
          Math.PI *
          2,

        wave:
          0.2 +
          random() * 0.8,

        baseY: y,
      });
    }
  );

  // =====================================================
  // MOUSE
  // =====================================================

  let mouseX = 0;

  let mouseY = 0;

  const onPointerMove = (
    event: PointerEvent
  ) => {
    const rect =
      canvas.getBoundingClientRect();

    mouseX =
      ((event.clientX -
        rect.left) /
        rect.width -
        0.5) *
      2;

    mouseY =
      ((event.clientY -
        rect.top) /
        rect.height -
        0.5) *
      2;
  };

  canvas.addEventListener(
    "pointermove",
    onPointerMove
  );

  // =====================================================
  // BUILD POINT CLOUD
  // =====================================================

  let cloudMesh:
    typeof pcs.mesh;

  pcs
    .buildMeshAsync(material)
    .then((mesh) => {
      cloudMesh = mesh;

      // Make sure Babylon doesn't cull the cloud.
      mesh.alwaysSelectAsActiveMesh =
        true;

      // Start with a visible cloud.
      pcs.setParticles();
    });

  // =====================================================
  // TIME
  // =====================================================

  let time = 0;

  // =====================================================
  // PARTICLE UPDATE
  // =====================================================

  pcs.updateParticle = (
    particle: any
  ) => {
    const index =
      particle.idx;

    const p =
      data[index];

    if (!p) {
      return particle;
    }

    // -----------------------------------------------
    // ORBIT
    // -----------------------------------------------

    const angle =
      p.angle +
      time * p.speed;

    const radius =
      p.radius +
      Math.sin(
        time * 0.4 +
          p.phase
      ) *
        0.12;

    let x =
      Math.cos(angle) *
      radius;

    let z =
      Math.sin(angle) *
      radius;

    // -----------------------------------------------
    // FLOATING MOTION
    // -----------------------------------------------

    let y =
      p.baseY +
      Math.sin(
        time * 0.8 +
          p.phase
      ) *
        p.wave;

    // -----------------------------------------------
    // SPIRAL
    // -----------------------------------------------

    const spiral =
      Math.sin(
        radius * 1.5 -
          time * 1.2
      ) *
      0.3;

    x +=
      Math.cos(
        angle +
          Math.PI / 2
      ) *
      spiral;

    z +=
      Math.sin(
        angle +
          Math.PI / 2
      ) *
      spiral;

    // -----------------------------------------------
    // MOUSE PARALLAX
    // -----------------------------------------------

    x +=
      mouseX *
      radius *
      0.06;

    y -=
      mouseY *
      radius *
      0.06;

    // -----------------------------------------------
    // POSITION
    // -----------------------------------------------

    particle.position.x =
      x;

    particle.position.y =
      y;

    particle.position.z =
      z;

    return particle;
  };

  // =====================================================
  // RENDER LOOP
  // =====================================================

  const render = () => {
    const dt =
      engine.getDeltaTime() /
      1000;

    time += dt;

    // -----------------------------------------------
    // ONLY UPDATE AFTER PCS IS READY
    // -----------------------------------------------

    if (pcs.mesh) {
      pcs.setParticles();

      pcs.mesh.rotation.y +=
        dt * 0.025;

      pcs.mesh.rotation.x =
        Math.sin(
          time * 0.15
        ) * 0.08;
    }

    scene.render();
  };

  engine.runRenderLoop(
    render
  );

  // =====================================================
  // RESIZE
  // =====================================================

  const onResize = () => {
    engine.resize();
  };

  window.addEventListener(
    "resize",
    onResize
  );

  // =====================================================
  // VISIBILITY
  // =====================================================

  const onVisibility = () => {
    if (document.hidden) {
      engine.stopRenderLoop();
    } else {
      engine.runRenderLoop(
        render
      );
    }
  };

  document.addEventListener(
    "visibilitychange",
    onVisibility
  );

  // =====================================================
  // CLEANUP
  // =====================================================

  return () => {
    canvas.removeEventListener(
      "pointermove",
      onPointerMove
    );

    window.removeEventListener(
      "resize",
      onResize
    );

    document.removeEventListener(
      "visibilitychange",
      onVisibility
    );

    pcs.dispose();

    glow.dispose();

    scene.dispose();

    engine.dispose();
  };
}

// =======================================================
// SEEDED RANDOM
// =======================================================

function mulberry32(
  seed: number
): () => number {
  let a =
    seed >>> 0;

  return () => {
    a =
      (a +
        0x6d2f5f5b) |
      0;

    let t =
      Math.imul(
        a ^
          (a >>> 15),
        1 | a
      );

    t =
      (t +
        Math.imul(
          t ^
            (t >>> 7),
          61 | t
        )) ^
      t;

    return (
      ((t ^
        (t >>> 14)) >>>
        0) /
      4294967296
    );
  };
}