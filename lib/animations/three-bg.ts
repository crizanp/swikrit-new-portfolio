"use client";

import * as THREE from "three";
import { gsap, ScrollTrigger, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap";

interface HeroThreeBackgroundOptions {
  canvasHost: HTMLElement;
  scrollTriggerSection: HTMLElement;
}

export function createHeroThreeBackground({
  canvasHost,
  scrollTriggerSection,
}: HeroThreeBackgroundOptions) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  registerGsapPlugins();

  const reduceMotion = prefersReducedMotion();
  const area = Math.max(canvasHost.clientWidth * canvasHost.clientHeight, 1);
  const adaptiveCount = Math.floor(area / (reduceMotion ? 2600 : 1800));
  const particleCount = Math.min(1200, Math.max(600, adaptiveCount));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    canvasHost.clientWidth / canvasHost.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
  renderer.setClearColor(0x000000, 0);
  canvasHost.appendChild(renderer.domElement);

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    const radius = 1.2 + Math.random() * 3.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    const isGold = Math.random() > 0.52;
    const color = isGold ? new THREE.Color("#8b5cf6") : new THREE.Color("#ffffff");

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.022,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const mouse = { x: 0, y: 0 };

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvasHost.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    mouse.x = x * 2 - 1;
    mouse.y = -(y * 2 - 1);
  };

  const onPointerLeave = () => {
    mouse.x = 0;
    mouse.y = 0;
  };

  canvasHost.addEventListener("pointermove", onPointerMove, { passive: true });
  canvasHost.addEventListener("pointerleave", onPointerLeave, { passive: true });

  const opacityState = { value: 0.9 };
  let scrollTween: gsap.core.Tween | undefined;

  if (!reduceMotion) {
    scrollTween = gsap.to(opacityState, {
      value: 0.12,
      ease: "none",
      scrollTrigger: {
        trigger: scrollTriggerSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      onUpdate: () => {
        material.opacity = opacityState.value;
      },
    });
  }

  const resizeObserver = new ResizeObserver(() => {
    const { clientWidth, clientHeight } = canvasHost;
    if (clientWidth === 0 || clientHeight === 0) {
      return;
    }

    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(clientWidth, clientHeight);
  });
  resizeObserver.observe(canvasHost);

  let rafId = 0;
  const clock = new THREE.Clock();

  const animate = () => {
    const elapsed = clock.getElapsedTime();

    if (!reduceMotion) {
      const orbit = elapsed * 0.12;
      camera.position.x = Math.sin(orbit) * 2.6 + mouse.x * 0.28;
      camera.position.y = mouse.y * 0.32;
      camera.position.z = Math.cos(orbit) * 2.8 + 3.2;
    }

    points.rotation.y = elapsed * 0.03;
    points.rotation.x = elapsed * 0.012;

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    rafId = window.requestAnimationFrame(animate);
  };

  animate();

  return () => {
    window.cancelAnimationFrame(rafId);
    canvasHost.removeEventListener("pointermove", onPointerMove);
    canvasHost.removeEventListener("pointerleave", onPointerLeave);
    resizeObserver.disconnect();
    scrollTween?.kill();
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.trigger === scrollTriggerSection) {
        trigger.kill();
      }
    });

    geometry.dispose();
    material.dispose();
    renderer.dispose();

    if (renderer.domElement.parentElement === canvasHost) {
      canvasHost.removeChild(renderer.domElement);
    }
  };
}
