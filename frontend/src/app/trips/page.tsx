"use client";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { Trip, TripData } from "@/components/RecentTrips/Trip";
import { Stay, StayData } from "@/components/RecentTrips/Stay";

export default function TripsPage() {
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
    {
      id: "s5",
      location: "Dubai",
      country: "UAE",
      flag: "🇦🇪",
      dates: "Jul 15-22, 2024",
      duration: "1 week",
      accommodationType: "hotel",
      icon: "🏢",
    },
    {
      id: "s6",
      location: "New York",
      country: "USA",
      flag: "🇺🇸",
      dates: "Jun 10-15, 2024",
      duration: "5 nights",
      accommodationType: "apartment",
      icon: "🏙️",
    },
    {
      id: "s7",
      location: "Barcelona",
      country: "Spain",
      flag: "🇪🇸",
      dates: "May 20-27, 2024",
      duration: "1 week",
      accommodationType: "airbnb",
      icon: "🏛️",
    },
    {
      id: "s8",
      location: "Bangkok",
      country: "Thailand",
      flag: "🇹🇭",
      dates: "Apr 12-18, 2024",
      duration: "6 nights",
      accommodationType: "hostel",
      icon: "🏯",
    },
    {
      id: "s9",
      location: "Rome",
      country: "Italy",
      flag: "🇮🇹",
      dates: "Mar 8-14, 2024",
      duration: "6 nights",
      accommodationType: "hotel",
      icon: "🏛️",
    },
    {
      id: "s10",
      location: "Santorini",
      country: "Greece",
      flag: "🇬🇷",
      dates: "Feb 14-21, 2024",
      duration: "1 week",
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

        {/* Enhanced Statistics Grid */}
        <div className="space-y-4 mb-8">
          {/* Primary Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Trips */}
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 overflow-hidden">
              <div className="absolute top-2 right-2 text-white/40 text-2xl">
                ✈️
              </div>
              <div className="relative">
                <div className="text-3xl font-bold text-white mb-1">
                  {totalTrips}
                </div>
                <div className="text-white/80 text-sm font-medium">
                  Total Trips
                </div>
                <div className="text-white/40 text-xs mt-1">
                  Life adventures
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 rounded-full"></div>
            </div>

            {/* Countries Visited */}
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 overflow-hidden">
              <div className="absolute top-2 right-2 text-white/40 text-2xl">
                🌍
              </div>
              <div className="relative">
                <div className="text-3xl font-bold text-white mb-1">
                  {uniqueCountries}
                </div>
                <div className="text-white/80 text-sm font-medium">
                  Countries
                </div>
                <div className="text-white/40 text-xs mt-1">Explored</div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 rounded-full"></div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* This Year */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="text-center">
                <div className="text-white/60 text-lg mb-2">📅</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {thisYearTrips}
                </div>
                <div className="text-white/60 text-xs">This Year</div>
              </div>
            </div>

            {/* Flights */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="text-center">
                <div className="text-white/60 text-lg mb-2">🛩️</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {flightCount}
                </div>
                <div className="text-white/60 text-xs">Flights</div>
              </div>
            </div>

            {/* Total Stays */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="text-center">
                <div className="text-white/60 text-lg mb-2">🏠</div>
                <div className="text-xl font-bold text-white mb-1">
                  {totalStays}
                </div>
                <div className="text-white/60 text-xs">Stays</div>
              </div>
            </div>
          </div>

          {/* Travel Methods Breakdown */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
            <h3 className="text-white font-semibold mb-4 text-sm">
              Travel Methods
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">✈️</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {flightCount}
                </div>
                <div className="text-white/60 text-xs">Flights</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🚗</span>
                </div>
                <div className="text-lg font-bold text-white">{carTrips}</div>
                <div className="text-white/60 text-xs">Car</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🚢</span>
                </div>
                <div className="text-lg font-bold text-white">{boatTrips}</div>
                <div className="text-white/60 text-xs">Boat</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Recent Activity
            </h2>
            <p className="text-white/50 text-xs mt-1">Your trips and stays</p>
          </div>
          <button className="bg-white/10 border border-white/20 text-white text-sm px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
            Filter
          </button>
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
