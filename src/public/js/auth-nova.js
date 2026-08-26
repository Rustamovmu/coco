import * as THREE from "https://esm.sh/three@0.136.0";

const container = document.querySelector("[data-auth-nova]");

if (container) {
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(60, 1, 1, 1000),
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }),
    clock = new THREE.Clock(),
    motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)"),
    particles = [],
    sizes = [],
    shifts = [];
  let animationFrame = 0;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x160016, 0);
  renderer.domElement.className = "auth-nova__canvas";
  container.prepend(renderer.domElement);
  camera.position.set(0, 4, 21);

  const addShift = () => {
    shifts.push(
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2,
      (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
      Math.random() * 0.9 + 0.1,
    );
  };

  for (let index = 0; index < 5000; index += 1) {
    particles.push(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 0.5 + 9.5));
    sizes.push(Math.random() * 1.5 + 0.5);
    addShift();
  }

  for (let index = 0; index < 15000; index += 1) {
    const innerRadius = 10,
      outerRadius = 40,
      randomRadius = Math.pow(Math.random(), 1.5),
      radius = Math.sqrt(outerRadius ** 2 * randomRadius + (1 - randomRadius) * innerRadius ** 2);

    particles.push(new THREE.Vector3().setFromCylindricalCoords(radius, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 2));
    sizes.push(Math.random() * 1.5 + 0.5);
    addShift();
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(particles);
  geometry.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("shift", new THREE.Float32BufferAttribute(shifts, 4));

  const uniforms = { time: { value: 0 } };
  const material = new THREE.PointsMaterial({
    blending: THREE.AdditiveBlending,
    depthTest: false,
    onBeforeCompile: (shader) => {
      shader.uniforms.time = uniforms.time;
      shader.vertexShader = `
        uniform float time;
        attribute float sizes;
        attribute vec4 shift;
        varying vec3 vColor;
        ${shader.vertexShader}
      `
        .replace("gl_PointSize = size;", "gl_PointSize = size * sizes;")
        .replace(
          "#include <color_vertex>",
          `#include <color_vertex>
          float distanceFromCenter = clamp(length(abs(position) / vec3(40.0, 10.0, 40.0)), 0.0, 1.0);
          vColor = mix(vec3(227.0, 155.0, 0.0), vec3(100.0, 50.0, 255.0), distanceFromCenter) / 255.0;`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          float movementTheta = mod(shift.x + shift.z * time, 6.28318530718);
          float movementPhi = mod(shift.y + shift.z * time, 6.28318530718);
          transformed += vec3(cos(movementPhi) * sin(movementTheta), cos(movementTheta), sin(movementPhi) * sin(movementTheta)) * shift.w;`,
        );
      shader.fragmentShader = `
        varying vec3 vColor;
        ${shader.fragmentShader}
      `
        .replace(
          "#include <clipping_planes_fragment>",
          `#include <clipping_planes_fragment>
          float pointDistance = length(gl_PointCoord.xy - 0.5);`,
        )
        .replace(
          "vec4 diffuseColor = vec4( diffuse, opacity );",
          "vec4 diffuseColor = vec4(vColor, smoothstep(0.5, 0.1, pointDistance));",
        );
    },
    size: 0.125,
    transparent: true,
  });

  const pointCloud = new THREE.Points(geometry, material);
  pointCloud.rotation.order = "ZYX";
  pointCloud.rotation.z = 0.2;
  scene.add(pointCloud);

  const render = () => {
    const elapsed = clock.getElapsedTime() * 0.5;
    uniforms.time.value = elapsed * Math.PI;
    pointCloud.rotation.y = elapsed * 0.05;
    renderer.render(scene, camera);
  };

  const animate = () => {
    render();
    if (!motionQuery.matches) animationFrame = window.requestAnimationFrame(animate);
  };

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  };

  const setMotion = () => {
    window.cancelAnimationFrame(animationFrame);
    render();
    if (!motionQuery.matches) animationFrame = window.requestAnimationFrame(animate);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  motionQuery.addEventListener("change", setMotion);
  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    motionQuery.removeEventListener("change", setMotion);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }, { once: true });
  setMotion();
}
