import React from "react";

export interface TripData {
  id: string;
  fromCountry: string;
  toCountry: string;
  fromFlag: string;
  toFlag: string;
  date: string;
  travelType: "car" | "boat" | "flight";
  icon: string;
}

interface TripProps {
  trip: TripData;
  onClick?: (trip: TripData) => void;
}

const getTravelTypeIcon = (travelType: TripData["travelType"]) => {
  switch (travelType) {
    case "flight":
      return "✈️";
    case "car":
      return "🚗";
    case "boat":
      return "🚢";
    default:
      return "🌍";
  }
};

const getTravelTypeColor = (travelType: TripData["travelType"]) => {
  switch (travelType) {
    case "flight":
      return "from-sky-500/30 to-blue-500/30";
    case "car":
      return "from-emerald-500/30 to-green-500/30";
    case "boat":
      return "from-cyan-500/30 to-teal-500/30";
    default:
      return "from-purple-500/30 to-pink-500/30";
  }
};

export const Trip: React.FC<TripProps> = ({ trip, onClick }) => {
  return (
    <div
      className="relative bg-slate-900/70 backdrop-blur-xl rounded-xl p-3 transition-all duration-300 cursor-pointer group hover:bg-white/8 active:scale-[0.98]"
      onClick={() => onClick?.(trip)}
    >
      {/* Background Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getTravelTypeColor(
          trip.travelType
        )} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative flex items-center space-x-3">
        {/* Trip Icon */}
        <div
          className={`w-10 h-10 bg-gradient-to-br ${getTravelTypeColor(
            trip.travelType
          )} rounded-lg flex items-center justify-center text-lg shadow-lg group-hover:scale-105 transition-transform duration-300`}
        >
          {trip.icon}
        </div>

        {/* Trip Details */}
        <div className="flex-1 min-w-0">
          {/* Route with Trip Tag */}
          <div className="flex items-center space-x-2 mb-1">
            <div className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
              TRIP
            </div>
            <span className="text-sm">{trip.fromFlag}</span>
            <span className="text-white font-medium text-sm truncate">
              {trip.fromCountry}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-xs">
                {getTravelTypeIcon(trip.travelType)}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/60"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm truncate">
              {trip.toCountry}
            </span>
            <span className="text-sm">{trip.toFlag}</span>
          </div>

          {/* Date and Travel Type */}
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <span>{trip.date}</span>
            <span>•</span>
            <span className="capitalize">{trip.travelType}</span>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="text-white/40 group-hover:text-white/70 transition-colors">
          <svg
            width="16"
            height="16"
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
  );
};
