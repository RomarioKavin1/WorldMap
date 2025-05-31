import React from "react";

export interface StayData {
  id: string;
  location: string;
  country: string;
  flag: string;
  dates: string;
  duration: string; // e.g., "3 nights", "1 week"
  accommodationType: "hotel" | "airbnb" | "hostel" | "resort" | "apartment";
  icon: string;
}

interface StayProps {
  stay: StayData;
  onClick?: (stay: StayData) => void;
}

const getAccommodationIcon = (type: StayData["accommodationType"]) => {
  switch (type) {
    case "hotel":
      return "🏨";
    case "airbnb":
      return "🏠";
    case "hostel":
      return "🏢";
    case "resort":
      return "🏖️";
    case "apartment":
      return "🏠";
    default:
      return "🏠";
  }
};

export const Stay: React.FC<StayProps> = ({ stay, onClick }) => {
  return (
    <div
      className="relative bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group hover:bg-white/8 active:scale-[0.98]"
      onClick={() => onClick?.(stay)}
    >
      <div className="relative flex items-center space-x-3">
        {/* Stay Icon */}
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
          {stay.icon}
        </div>

        {/* Stay Details */}
        <div className="flex-1 min-w-0">
          {/* Location with Stay Tag */}
          <div className="flex items-center space-x-2 mb-1">
            <div className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full font-medium">
              STAY
            </div>
            <span className="text-sm">{stay.flag}</span>
            <span className="text-white font-medium text-sm truncate">
              {stay.location}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-xs">
                {getAccommodationIcon(stay.accommodationType)}
              </span>
            </div>
            <span className="text-white/60 text-xs truncate">
              {stay.country}
            </span>
          </div>

          {/* Date and Duration */}
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <span>{stay.dates}</span>
            <span>•</span>
            <span>{stay.duration}</span>
            <span>•</span>
            <span className="capitalize">{stay.accommodationType}</span>
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
