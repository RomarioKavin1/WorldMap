"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ThreeGlobeLib from "three-globe";

export const ThreeGlobeHex: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 300;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create hex polygon globe
    const globe = new ThreeGlobeLib().globeImageUrl(
      "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
    );

    // Create a group for proper tilted rotation
    const earthGroup = new THREE.Group();

    // Add Earth's axial tilt to the group
    earthGroup.rotation.z = (23.5 * Math.PI) / 180;

    // Add globe to the tilted group instead of directly to scene
    earthGroup.add(globe);

    // Add the tilted group to scene
    scene.add(earthGroup);

    // Setup user controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth camera controls
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = false; // Disable panning for better UX
    controls.minDistance = 200; // Minimum zoom distance
    controls.maxDistance = 600; // Maximum zoom distance
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 0.6;

    // Load countries data and create hex polygons
    fetch("./ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then((countries) => {
        globe
          .hexPolygonsData(countries.features)
          .hexPolygonResolution(3)
          .hexPolygonMargin(0.3)
          .hexPolygonUseDots(true)
          .hexPolygonColor(
            () =>
              `#${Math.round(Math.random() * Math.pow(2, 24))
                .toString(16)
                .padStart(6, "0")}`
          );
      })
      .catch((err) => console.warn("Could not load countries data:", err));

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xcccccc, Math.PI);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      0.6 * Math.PI
    );
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Update controls (for damping)
      controls.update();

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = (window.innerWidth * 0.8) / (window.innerHeight * 0.5);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.5);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", handleResize);

      // Dispose controls
      controls.dispose();

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Dispose of Three.js objects
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute z-0 h-ful w-full flex items-center justify-center cursor-grab active:cursor-grabbing -mt-60"
      style={{
        zIndex: 1,
        opacity: 0.9,
      }}
    />
  );
};
