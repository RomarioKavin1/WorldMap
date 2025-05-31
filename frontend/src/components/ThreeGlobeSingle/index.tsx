"use client";
/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ThreeGlobeLib from "three-globe";

interface ArcCoordinate {
  lat: number;
  lng: number;
}

interface SingleArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

interface ThreeGlobeSingleProps {
  fromCoords: ArcCoordinate;
  toCoords: ArcCoordinate;
  autoRotate?: boolean;
  showAnimation?: boolean;
}

export const ThreeGlobeSingle: React.FC<ThreeGlobeSingleProps> = ({
  fromCoords,
  toCoords,
  autoRotate = true,
  showAnimation = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const globeRef = useRef<ThreeGlobeLib | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);

  // Create single arc from coordinates
  const singleArc: SingleArc = {
    startLat: fromCoords.lat,
    startLng: fromCoords.lng,
    endLat: toCoords.lat,
    endLng: toCoords.lng,
  };

  // Log arc coordinates for debugging
  console.log("ThreeGlobeSingle received coordinates:");
  console.log("From:", fromCoords);
  console.log("To:", toCoords);
  console.log("Generated arc:", singleArc);

  // Validate coordinates
  const isValidCoordinate = (lat: number, lng: number) => {
    return (
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  };

  if (!isValidCoordinate(singleArc.startLat, singleArc.startLng)) {
    console.error(
      "Invalid start coordinates:",
      singleArc.startLat,
      singleArc.startLng
    );
  }
  if (!isValidCoordinate(singleArc.endLat, singleArc.endLng)) {
    console.error(
      "Invalid end coordinates:",
      singleArc.endLat,
      singleArc.endLng
    );
  }

  useEffect(() => {
    const mountElement = mountRef.current;
    if (!mountElement) return;

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
    mountElement.appendChild(renderer.domElement);

    // Create globe
    const globe = new ThreeGlobeLib().globeImageUrl(
      "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
    );
    globeRef.current = globe;

    // Create a group for proper tilted rotation
    const earthGroup = new THREE.Group();

    // Add Earth's axial tilt to the group
    earthGroup.rotation.z = (23.5 * Math.PI) / 180;

    // Add globe to the tilted group instead of directly to scene
    earthGroup.add(globe);
    earthGroupRef.current = earthGroup;

    // Add the tilted group to scene
    scene.add(earthGroup);

    // Setup user controls (always enabled)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = false;
    controls.minDistance = 200;
    controls.maxDistance = 600;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 0.6;

    // Setup single arc immediately (with pulsing dash animation like ThreeGlobeHex)
    console.log("Setting up single arc:", singleArc);
    globe
      .arcsData([singleArc])
      .arcColor(() => "#ff6600") // Same orange color as ThreeGlobeHex
      .arcDashLength(0.9) // Same as ThreeGlobeHex
      .arcDashGap(0.1) // Same as ThreeGlobeHex
      .arcDashAnimateTime(showAnimation ? 2000 : 0) // Same pulsing animation as ThreeGlobeHex
      .arcStroke(3) // Slightly thicker for better visibility
      .arcAltitude(0.3); // Same as ThreeGlobeHex

    // Load countries data and create hex polygons
    fetch("/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then((countries) => {
        console.log("Countries data loaded, setting up hexagons");
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

        console.log("Single arc globe fully initialized with hexagons and arc");

        // Auto-rotate to show the arc if enabled
        if (autoRotate) {
          setTimeout(() => {
            rotateGlobeToArc(singleArc);
          }, 1000);
        }
      })
      .catch((err) => {
        console.warn("Could not load countries data:", err);
        console.log("Globe initialized with arc only (no hexagons)");

        // Still auto-rotate even without hexagons
        if (autoRotate) {
          setTimeout(() => {
            rotateGlobeToArc(singleArc);
          }, 1000);
        }
      });

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xcccccc, Math.PI);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      0.8 * Math.PI
    );
    scene.add(directionalLight);

    // Simple animation loop (no custom pulsing needed)
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

      // Dispose controls
      controls.dispose();

      if (mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement);
      }

      // Dispose of Three.js objects
      scene.clear();
      renderer.dispose();
    };
  }, [fromCoords, toCoords, showAnimation]); // Re-render when coordinates change

  // Function to smoothly rotate globe to show the arc
  const rotateGlobeToArc = (arc: SingleArc) => {
    if (!earthGroupRef.current || !globeRef.current) return;

    // Calculate the center point between start and end coordinates
    const centerLat = (arc.startLat + arc.endLat) / 2;
    const centerLng = (arc.startLng + arc.endLng) / 2;

    // Convert to radians
    const targetLat = (centerLat * Math.PI) / 180;
    const targetLng = (centerLng * Math.PI) / 180;

    // Calculate target rotation for the earth group
    const targetRotationY = -targetLng;
    const targetRotationX = targetLat;

    const earthGroup = earthGroupRef.current;
    const startRotationX = earthGroup.rotation.x;
    const startRotationY = earthGroup.rotation.y;

    // Keep the existing Z rotation (Earth's tilt)
    const currentTilt = earthGroup.rotation.z;

    let progress = 0;
    const rotateGlobe = () => {
      progress += 0.01; // Slower rotation for better viewing

      if (progress >= 1) {
        progress = 1;
      }

      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate rotations
      earthGroup.rotation.x =
        startRotationX + (targetRotationX - startRotationX) * eased;
      earthGroup.rotation.y =
        startRotationY + (targetRotationY - startRotationY) * eased;
      earthGroup.rotation.z = currentTilt;

      if (progress < 1) {
        requestAnimationFrame(rotateGlobe);
      } else {
        console.log(
          `Globe centered on arc: ${arc.startLat.toFixed(
            2
          )}, ${arc.startLng.toFixed(2)} → ${arc.endLat.toFixed(
            2
          )}, ${arc.endLng.toFixed(2)}`
        );
      }
    };

    rotateGlobe();
  };

  return (
    <div
      ref={mountRef}
      className="absolute z-0 h-full w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      style={{
        zIndex: 1,
        opacity: 0.9,
      }}
    />
  );
};
