"use client";
/* eslint-disable react/prop-types */
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ThreeGlobeLib from "three-globe";

interface ArcCoordinate {
  lat: number;
  lng: number;
}

interface ProcessedArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  pathIndex: number;
  segmentIndex: number;
  id: string;
}

interface ThreeGlobeHexProps {
  arcPaths?: ArcCoordinate[][];
  animationSpeed?: number; // seconds per arc
  autoRotate?: boolean;
}

export const ThreeGlobeHex: React.FC<ThreeGlobeHexProps> = ({
  arcPaths = [],
  animationSpeed = 3,
  autoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const globeRef = useRef<ThreeGlobeLib | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize arc processing to prevent unnecessary recalculations
  const arcs = useMemo(() => {
    const processedArcs: ProcessedArc[] = [];
    if (arcPaths && arcPaths.length > 0) {
      arcPaths.forEach((path, pathIndex) => {
        for (let i = 0; i < path.length - 1; i++) {
          const start = path[i];
          const end = path[i + 1];
          processedArcs.push({
            startLat: start.lat,
            startLng: start.lng,
            endLat: end.lat,
            endLng: end.lng,
            pathIndex,
            segmentIndex: i,
            id: `${pathIndex}-${i}`,
          });
        }
      });
    }
    console.log("Processed arcs:", processedArcs.length, processedArcs);
    return processedArcs;
  }, [arcPaths]);

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

    // Create hex polygon globe
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

        // Setup arcs layer after countries are loaded
        globe
          .arcsData([])
          .arcColor(() => "#ff6600")
          .arcDashLength(0.9)
          .arcDashGap(0.1)
          .arcDashAnimateTime(2000)
          .arcStroke(2)
          .arcAltitude(0.3);

        console.log("Globe initialized with countries and arcs layer");
      })
      .catch((err) => console.warn("Could not load countries data:", err));

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xcccccc, Math.PI);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      0.8 * Math.PI
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

      // Clear animation timer
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }

      // Dispose controls
      controls.dispose();

      if (mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement);
      }

      // Dispose of Three.js objects
      scene.clear();
      renderer.dispose();
    };
  }, []); // Only run once on mount

  // Arc animation effect - rotates globe to show each arc
  useEffect(() => {
    console.log("Arc animation effect running:", {
      hasGlobe: !!globeRef.current,
      hasEarthGroup: !!earthGroupRef.current,
      arcsLength: arcs.length,
      autoRotate,
    });

    if (!globeRef.current || !earthGroupRef.current || arcs.length === 0) {
      console.log("Arc animation not starting - missing requirements");
      return;
    }

    // Start the animation cycle
    let currentIndex = 0;

    const showNextArc = () => {
      if (currentIndex >= arcs.length) {
        currentIndex = 0;
      }

      const currentArc = arcs[currentIndex];

      console.log("Setting arc data for globe:", currentArc);

      // Show current arc
      if (globeRef.current) {
        globeRef.current.arcsData([currentArc]);
      }

      console.log(
        `Showing arc ${currentIndex + 1}/${arcs.length}:`,
        currentArc
      );

      // Rotate globe to show the arc if autoRotate is enabled
      if (autoRotate && earthGroupRef.current) {
        rotateGlobeToArc(currentArc);
      }

      // Move to next arc
      currentIndex++;

      // Set timer for next arc
      animationTimerRef.current = setTimeout(
        showNextArc,
        animationSpeed * 1000
      );
    };

    // Start the cycle with a small delay to ensure globe is ready
    const startTimer = setTimeout(() => {
      console.log("Starting arc animation cycle");
      showNextArc();
    }, 1000);

    return () => {
      clearTimeout(startTimer);
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [arcs, animationSpeed, autoRotate]);

  // Function to smoothly rotate globe to show current arc
  const rotateGlobeToArc = (arc: ProcessedArc) => {
    if (!earthGroupRef.current || !globeRef.current) return;

    // Calculate the center point between start and end coordinates
    const centerLat = (arc.startLat + arc.endLat) / 2;
    const centerLng = (arc.startLng + arc.endLng) / 2;

    // Convert to radians
    const targetLat = (centerLat * Math.PI) / 180;
    const targetLng = (centerLng * Math.PI) / 180;

    // Calculate target rotation for the earth group
    // We want to rotate the globe so the arc center faces the camera
    const targetRotationY = -targetLng; // Longitude controls Y rotation
    const targetRotationX = targetLat; // Latitude controls X rotation (with some adjustment)

    const earthGroup = earthGroupRef.current;
    const startRotationX = earthGroup.rotation.x;
    const startRotationY = earthGroup.rotation.y;

    // Keep the existing Z rotation (Earth's tilt)
    const currentTilt = earthGroup.rotation.z;

    let progress = 0;
    const rotateGlobe = () => {
      progress += 0.02; // Smooth rotation speed

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
      earthGroup.rotation.z = currentTilt; // Maintain Earth's tilt

      if (progress < 1) {
        requestAnimationFrame(rotateGlobe);
      } else {
        console.log(
          `Globe rotated to show arc: ${arc.startLat.toFixed(
            2
          )}, ${arc.startLng.toFixed(2)} -> ${arc.endLat.toFixed(
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
      className="absolute z-0 h-ful w-full flex items-center justify-center cursor-grab active:cursor-grabbing -mt-60"
      style={{
        zIndex: 1,
        opacity: 0.9,
      }}
    />
  );
};
