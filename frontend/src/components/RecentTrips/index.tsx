"use client";

interface Trip {
  id: string;
  destination: string;
  country: string;
  dates: string;
  image: string;
  flag: string;
}

export const RecentTrips: React.FC = () => {
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
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Recent Trips</h2>
        <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
          View All
        </button>
      </div>

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
          <p className="text-white/40 text-sm">Start exploring the world!</p>
        </div>
      )}
    </div>
  );
};
