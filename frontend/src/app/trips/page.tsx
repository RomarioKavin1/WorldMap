"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { Trip, type TripData } from "@/components/RecentTrips/Trip";
import { Stay, type StayData } from "@/components/RecentTrips/Stay";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

export default function TripsPage() {
  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Autoplay carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Mock trip data
  const allTrips: TripData[] = [
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
  ];

  // Mock stay data
  const allStays: StayData[] = [
    {
      id: "s1",
      location: "Tokyo",
      country: "Japan",
      flag: "🇯🇵",
      dates: "Dec 15-20, 2024",
      duration: "5 nights",
      accommodationType: "hotel",
      icon: "🏙️",
    },
    {
      id: "s2",
      location: "Paris",
      country: "France",
      flag: "🇫🇷",
      dates: "Nov 10-17, 2024",
      duration: "1 week",
      accommodationType: "airbnb",
      icon: "🗼",
    },
    {
      id: "s3",
      location: "London",
      country: "UK",
      flag: "🇬🇧",
      dates: "Sep 5-12, 2024",
      duration: "1 week",
      accommodationType: "hotel",
      icon: "🏰",
    },
    {
      id: "s4",
      location: "Sydney",
      country: "Australia",
      flag: "🇦🇺",
      dates: "Aug 20-30, 2024",
      duration: "10 nights",
      accommodationType: "resort",
      icon: "🏖️",
    },
  ];

  // Calculate statistics
  const totalTrips = allTrips.length;
  const totalStays = allStays.length;
  const uniqueCountries = new Set([
    ...allTrips.map((t) => t.fromCountry),
    ...allTrips.map((t) => t.toCountry),
    ...allStays.map((s) => s.country),
  ]).size;
  const flightCount = allTrips.filter((t) => t.travelType === "flight").length;
  const currentYear = new Date().getFullYear();
  const thisYearTrips = allTrips.filter((t) =>
    t.date.includes(currentYear.toString())
  ).length;
  const carTrips = allTrips.filter((t) => t.travelType === "car").length;
  const boatTrips = allTrips.filter((t) => t.travelType === "boat").length;

  // Chart data with muted colors
  const transportData = [
    { name: "Flight", value: flightCount, color: "rgba(255, 255, 255, 0.8)" },
    { name: "Car", value: carTrips, color: "rgba(255, 255, 255, 0.6)" },
    { name: "Boat", value: boatTrips, color: "rgba(255, 255, 255, 0.4)" },
  ];

  // Monthly trip distribution (mock data based on our trips)
  const monthlyData = [
    { month: "Aug", trips: 1 },
    { month: "Sep", trips: 1 },
    { month: "Oct", trips: 1 },
    { month: "Nov", trips: 1 },
    { month: "Dec", trips: 1 },
  ];

  // Accommodation types data with muted colors
  const accommodationData = [
    {
      name: "Hotel",
      value: allStays.filter((s) => s.accommodationType === "hotel").length,
      color: "rgba(255, 255, 255, 0.8)",
    },
    {
      name: "Airbnb",
      value: allStays.filter((s) => s.accommodationType === "airbnb").length,
      color: "rgba(255, 255, 255, 0.6)",
    },
    {
      name: "Resort",
      value: allStays.filter((s) => s.accommodationType === "resort").length,
      color: "rgba(255, 255, 255, 0.4)",
    },
  ];

  // Combine and sort trips and stays by date (mock sorting)
  const allActivities = [
    ...allTrips.map((trip) => ({ ...trip, type: "trip" as const })),
    ...allStays.map((stay) => ({ ...stay, type: "stay" as const })),
  ].sort((a, b) => {
    // Simple date sorting by month mentioned in date string
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const aDateStr = a.type === "trip" ? a.date : a.dates;
    const bDateStr = b.type === "trip" ? b.date : b.dates;
    const aMonth = months.findIndex((month) => aDateStr.includes(month));
    const bMonth = months.findIndex((month) => bDateStr.includes(month));
    return bMonth - aMonth; // Reverse chronological order
  });

  const handleTripClick = (trip: TripData) => {
    console.log("Trip clicked:", trip);
  };

  const handleStayClick = (stay: StayData) => {
    console.log("Stay clicked:", stay);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-sm p-2 rounded-md border border-white/10 text-xs">
          <p className="text-white">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="flex-1 p-4 mt-12 pb-20">
        {/* Page Title with Enhanced Styling */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Trips</h1>
          <p className="text-white/60 text-sm">
            Explore your journey around the world
          </p>
        </div>

        {/* Statistics Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Travel Statistics
            </h2>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-2xl">
              <motion.div
                className="flex"
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Slide 1: Key Metrics */}
                <div className="w-full flex-shrink-0">
                  <div className="backdrop-blur-xl rounded-2xl p-6  mx-1">
                    <h3 className="text-white/80 text-sm font-medium mb-6 text-center">
                      Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          {totalTrips}
                        </div>
                        <div className="text-white/60 text-sm">Total Trips</div>
                        <div className="text-white/40 text-xs mt-1">
                          ✈️ Adventures
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">
                          {uniqueCountries}
                        </div>
                        <div className="text-white/60 text-sm">Countries</div>
                        <div className="text-white/40 text-xs mt-1">
                          🌍 Explored
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {totalStays}
                        </div>
                        <div className="text-white/60 text-sm">Total Stays</div>
                        <div className="text-white/40 text-xs mt-1">
                          🏠 Nights
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {thisYearTrips}
                        </div>
                        <div className="text-white/60 text-sm">This Year</div>
                        <div className="text-white/40 text-xs mt-1">
                          📅 Recent
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide 2: Transport Methods */}
                <div className="w-full flex-shrink-0">
                  <div className=" backdrop-blur-xl rounded-2xl p-6 mx-1">
                    <h3 className="text-white/80 text-sm font-medium mb-4 text-center">
                      Transport Methods
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={transportData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={300}
                            animationDuration={1000}
                          >
                            {transportData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      {transportData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-xs text-white/70">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Slide 3: Monthly Distribution */}
                <div className="w-full flex-shrink-0">
                  <div className=" backdrop-blur-xl rounded-2xl p-6 mx-1">
                    <h3 className="text-white/80 text-sm font-medium mb-4 text-center">
                      Monthly Activity
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                          <XAxis
                            dataKey="month"
                            tick={{
                              fill: "rgba(255, 255, 255, 0.5)",
                              fontSize: 11,
                            }}
                            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{
                              fill: "rgba(255, 255, 255, 0.5)",
                              fontSize: 11,
                            }}
                            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="trips"
                            stroke="rgba(255, 255, 255, 0.8)"
                            strokeWidth={2}
                            dot={{ fill: "rgba(255, 255, 255, 0.8)", r: 3 }}
                            activeDot={{
                              r: 5,
                              fill: "#fff",
                              stroke: "rgba(255, 255, 255, 0.8)",
                            }}
                            animationDuration={1500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Slide 4: Accommodation Types */}
                <div className="w-full flex-shrink-0">
                  <div className="backdrop-blur-xl rounded-2xl p-6 mx-1">
                    <h3 className="text-white/80 text-sm font-medium mb-4 text-center">
                      Accommodation
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={accommodationData}>
                          <XAxis
                            dataKey="name"
                            tick={{
                              fill: "rgba(255, 255, 255, 0.5)",
                              fontSize: 11,
                            }}
                            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{
                              fill: "rgba(255, 255, 255, 0.5)",
                              fontSize: 11,
                            }}
                            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="value"
                            animationDuration={1500}
                            radius={[4, 4, 0, 0]}
                          >
                            {accommodationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Dot Navigation */}
            <div className="flex justify-center gap-2 mt-4 z-10">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? "bg-white" : "bg-white/30"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index ? "bg-white" : "bg-white/30"
                    }`}
                  ></div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Activities Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Recent Activity
            </h2>
            <p className="text-white/50 text-xs mt-1">Your trips and stays</p>
          </div>
        </div>

        {/* Activities List (Mixed Trips and Stays) */}
        {allActivities.length > 0 ? (
          <div className="space-y-3">
            {allActivities.map((activity) =>
              activity.type === "trip" ? (
                <Trip
                  key={activity.id}
                  trip={activity}
                  onClick={handleTripClick}
                />
              ) : (
                <Stay
                  key={activity.id}
                  stay={activity}
                  onClick={handleStayClick}
                />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✈️</span>
            </div>
            <h3 className="text-white/60 text-lg mb-2">No trips yet</h3>
            <p className="text-white/40 text-sm">Start exploring the world!</p>
            <button className="mt-4 bg-white/10 border border-white/20 text-white px-6 py-2 rounded-xl hover:bg-white/20 transition-colors">
              Plan Your First Trip
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="trips" />
    </div>
  );
}
