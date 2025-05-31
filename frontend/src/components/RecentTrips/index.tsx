"use client";
import { useState, useRef, useEffect } from "react";

interface Trip {
  id: string;
  destination: string;
  country: string;
  dates: string;
  image: string;
  flag: string;
}

type DrawerState = "collapsed" | "partial" | "expanded";

export const RecentTrips: React.FC = () => {
  const [drawerState, setDrawerState] = useState<DrawerState>("partial");
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with real data later
  const recentTrips: Trip[] = [
    {
      id: "1",
      destination: "Tokyo",
      country: "Japan",
      dates: "Dec 2024",
      image: "🗼",
      flag: "🇯🇵",
    },
    {
      id: "2",
      destination: "Paris",
      country: "France",
      dates: "Nov 2024",
      image: "🗼",
      flag: "🇫🇷",
    },
    {
      id: "3",
      destination: "New York",
      country: "USA",
      dates: "Oct 2024",
      image: "🏙️",
      flag: "🇺🇸",
    },
    {
      id: "4",
      destination: "London",
      country: "UK",
      dates: "Sep 2024",
      image: "🏰",
      flag: "🇬🇧",
    },
    {
      id: "5",
      destination: "Sydney",
      country: "Australia",
      dates: "Aug 2024",
      image: "🏙️",
      flag: "🇦🇺",
    },
    {
      id: "6",
      destination: "Dubai",
      country: "UAE",
      dates: "Jul 2024",
      image: "🏢",
      flag: "🇦🇪",
    },
  ];

  // Drawer positions (from bottom)
  const getDrawerPosition = () => {
    switch (drawerState) {
      case "collapsed":
        return "translate-y-[calc(100%-80px)]"; // Show only handle + small peek
      case "partial":
        return "translate-y-[calc(100%-280px)]"; // Show header + few trips
      case "expanded":
        return "translate-y-0"; // Full screen
      default:
        return "translate-y-[calc(100%-280px)]";
    }
  };

  // Handle drag start
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setCurrentY(clientY);
  };

  // Handle drag move
  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    setCurrentY(clientY);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;

    const deltaY = currentY - startY;
    const threshold = 50; // Minimum drag distance to trigger state change

    if (deltaY > threshold) {
      // Dragging down
      if (drawerState === "expanded") {
        setDrawerState("partial");
      } else if (drawerState === "partial") {
        setDrawerState("collapsed");
      }
    } else if (deltaY < -threshold) {
      // Dragging up
      if (drawerState === "collapsed") {
        setDrawerState("partial");
      } else if (drawerState === "partial") {
        setDrawerState("expanded");
      }
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add global event listeners for drag
  useEffect(() => {
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
  }, [isDragging, startY, currentY]);

  // Calculate dynamic transform during drag
  const getDynamicTransform = () => {
    if (!isDragging) return "";

    const deltaY = currentY - startY;
    const baseTransform = getDrawerPosition();

    // Apply drag offset with bounds
    const maxDrag = 100; // Maximum drag distance
    const boundedDelta = Math.max(-maxDrag, Math.min(maxDrag, deltaY));

    return `${baseTransform.replace(
      "translate-y-",
      "translate-y-[calc("
    )}+${boundedDelta}px)]`;
  };

  return (
    <>
      {/* Backdrop for expanded state */}
      {drawerState === "expanded" && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setDrawerState("partial")}
        />
      )}

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          isDragging ? "" : getDrawerPosition()
        }`}
        style={isDragging ? { transform: getDynamicTransform() } : {}}
      >
        {/* Drawer Content */}
        <div className="bg-black/95 backdrop-blur-3xl rounded-t-3xl border-t border-white/10 shadow-2xl">
          {/* Drag Handle */}
          <div
            className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
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
            className={`${
              drawerState === "collapsed" ? "h-0 overflow-hidden" : "h-auto"
            } transition-all duration-300`}
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
                  <div
                    key={trip.id}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
                        {trip.image}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-semibold">
                            {trip.destination}
                          </h3>
                          <span className="text-lg">{trip.flag}</span>
                        </div>
                        <p className="text-white/60 text-sm">
                          {trip.country} • {trip.dates}
                        </p>
                      </div>

                      <div className="text-white/40">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  </div>
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
                        {new Set(recentTrips.map((t) => t.country)).size}
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
