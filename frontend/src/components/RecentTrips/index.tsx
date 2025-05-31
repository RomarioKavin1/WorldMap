"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Trip, TripData } from "./Trip";

type DrawerState = "collapsed" | "partial" | "expanded";

export const RecentTrips: React.FC = () => {
  const [drawerState, setDrawerState] = useState<DrawerState>("partial");
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Updated mock data with new structure
  const recentTrips: TripData[] = [
    {
      id: "1",
      fromCountry: "USA",
      toCountry: "Japan",
      fromFlag: "🇺🇸",
      toFlag: "🇯🇵",
      date: "Dec 2024",
      travelType: "flight",
      icon: "🗼",
    },
    {
      id: "2",
      fromCountry: "Japan",
      toCountry: "France",
      fromFlag: "🇯🇵",
      toFlag: "🇫🇷",
      date: "Nov 2024",
      travelType: "flight",
      icon: "🗼",
    },
    {
      id: "3",
      fromCountry: "France",
      toCountry: "USA",
      fromFlag: "🇫🇷",
      toFlag: "🇺🇸",
      date: "Oct 2024",
      travelType: "flight",
      icon: "🏙️",
    },
    {
      id: "4",
      fromCountry: "USA",
      toCountry: "UK",
      fromFlag: "🇺🇸",
      toFlag: "🇬🇧",
      date: "Sep 2024",
      travelType: "car",
      icon: "🏰",
    },
    {
      id: "5",
      fromCountry: "UK",
      toCountry: "Australia",
      fromFlag: "🇬🇧",
      toFlag: "🇦🇺",
      date: "Aug 2024",
      travelType: "flight",
      icon: "🏙️",
    },
    {
      id: "6",
      fromCountry: "Australia",
      toCountry: "UAE",
      fromFlag: "🇦🇺",
      toFlag: "🇦🇪",
      date: "Jul 2024",
      travelType: "boat",
      icon: "🏢",
    },
  ];

  // Handle trip click
  const handleTripClick = (trip: TripData) => {
    console.log("Trip clicked:", trip);
    // Add your trip click logic here
  };

  // Drawer positions (from bottom)
  const getDrawerPosition = () => {
    switch (drawerState) {
      case "collapsed":
        return "calc(100% - 90px)";
      case "partial":
        return "calc(100% - 320px)";
      case "expanded":
        return "0px";
      default:
        return "calc(100% - 320px)";
    }
  };

  // Handle drag start
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setDragOffset(0);
  };

  // Handle drag move
  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;

      const deltaY = clientY - startY;
      // Apply resistance for more natural feel
      const resistance = 0.7;
      setDragOffset(deltaY * resistance);
    },
    [isDragging, startY]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    const threshold = 60;

    if (dragOffset > threshold) {
      // Dragging down
      if (drawerState === "expanded") {
        setDrawerState("partial");
      } else if (drawerState === "partial") {
        setDrawerState("collapsed");
      }
    } else if (dragOffset < -threshold) {
      // Dragging up
      if (drawerState === "collapsed") {
        setDrawerState("partial");
      } else if (drawerState === "partial") {
        setDrawerState("expanded");
      }
    }

    setIsDragging(false);
    setStartY(0);
    setDragOffset(0);
  }, [isDragging, dragOffset, drawerState]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  // Add global event listeners for drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleDragMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Calculate final transform
  const getTransform = () => {
    const basePosition = getDrawerPosition();
    if (isDragging && dragOffset !== 0) {
      return `translateY(calc(${basePosition} + ${dragOffset}px))`;
    }
    return `translateY(${basePosition})`;
  };

  return (
    <>
      {/* Backdrop for expanded state */}
      {drawerState === "expanded" && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setDrawerState("partial")}
        />
      )}

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 ${
          isDragging ? "" : "transition-transform duration-300 ease-out"
        }`}
        style={{
          transform: getTransform(),
        }}
      >
        {/* Glass Morphic Drawer Content */}
        <div
          className="bg-black/90 backdrop-blur-2xl rounded-t-3xl border-t border-white/20 shadow-2xl  active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Drag Handle */}
          <div
            className="flex justify-center pt-4 pb-2 cursor-grab"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="w-12 h-1.5 bg-white/40 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Recent Trips</h2>
              <div className="flex items-center space-x-3">
                <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                  View All
                </button>
                {drawerState !== "collapsed" && (
                  <button
                    onClick={() =>
                      setDrawerState(
                        drawerState === "expanded" ? "partial" : "expanded"
                      )
                    }
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`text-white transition-transform duration-200 ${
                        drawerState === "expanded" ? "rotate-180" : ""
                      }`}
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-300 ${
              drawerState === "collapsed" ? "h-0 overflow-hidden" : "h-auto"
            }`}
          >
            <div
              className={`p-6 ${
                drawerState === "expanded"
                  ? "max-h-[calc(100vh-200px)] overflow-y-auto"
                  : "max-h-60 overflow-y-auto"
              }`}
            >
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <Trip key={trip.id} trip={trip} onClick={handleTripClick} />
                ))}
              </div>

              {recentTrips.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌍</div>
                  <h3 className="text-white/60 text-lg mb-2">No trips yet</h3>
                  <p className="text-white/40 text-sm">
                    Start exploring the world!
                  </p>
                </div>
              )}

              {/* Extra content for expanded view */}
              {drawerState === "expanded" && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Trip Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {recentTrips.length}
                      </div>
                      <div className="text-white/60 text-sm">Total Trips</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {
                          new Set([
                            ...recentTrips.map((t) => t.fromCountry),
                            ...recentTrips.map((t) => t.toCountry),
                          ]).size
                        }
                      </div>
                      <div className="text-white/60 text-sm">Countries</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
