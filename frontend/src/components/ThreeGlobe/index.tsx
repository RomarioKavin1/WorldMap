"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import ThreeGlobeLib from "three-globe";

export const ThreeGlobeComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 250;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create globe with enhanced visibility
    const globe = new ThreeGlobeLib()
      .globeImageUrl(
        "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      )
      .bumpImageUrl(
        "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      );

    // Add Earth's axial tilt
    globe.rotation.z = (23.5 * Math.PI) / 180;

    // Add globe to scene
    scene.add(globe);

    // Generate random points for visual interest
    const pointsData = Array.from({ length: 150 }, () => ({
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      size: Math.random() * 0.4 + 0.2,
      color: "#64b5f6",
    }));

    globe
      .pointsData(pointsData)
      .pointColor("color")
      .pointAltitude(0.03)
      .pointRadius("size");

    // Generate arcs for connectivity visualization
    const arcsData = Array.from({ length: 25 }, () => {
      const start = pointsData[Math.floor(Math.random() * pointsData.length)];
      const end = pointsData[Math.floor(Math.random() * pointsData.length)];
      return {
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
      };
    });

    globe
      .arcsData(arcsData)
      .arcColor(() => ["#4a90e2", "#64b5f6"])
      .arcDashLength(0.6)
      .arcDashGap(1.5)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(4000)
      .arcStroke(0.3);

    // Enhanced lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 20.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Additional light from the opposite side to illuminate the dark side
    const backLight = new THREE.DirectionalLight(0x4a90e2, 10.3);
    backLight.position.set(-100, -50, -100);
    scene.add(backLight);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Rotate globe
      globe.rotation.y += 0.002;

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", handleResize);

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
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        opacity: 1,
      }}
    />
  );
};
